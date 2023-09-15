"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import type { Items, PlVideos } from "@/types";
import { Icons } from "@/assets/Icons";

import fetchVideosIds from "@/utils/fetchVideosIds";
import getPlaylistSize from "@/utils/getPlaylistSize";
import getVideosSlice from "@/utils/getVideosSlice";
import seekTime from "@/utils/seekTime";
import LogoButton from "./LogoButton";
import savePlaylistsProgress from "@/utils/savePlaylistProgress";
import loadPlaylist from "@/utils/loadPlaylist";
import DeleteModalContent from "./modals/DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";
import onDeleteItems from "@/utils/onDeleteItem";
import reduceStringSize from "@/utils/reduceStringLength";

type Params = {
  list: string;
  title: string;
};

export default function YoutubePlayer({ params }: { params: Params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(1);

  const isPaused = useRef(false); // used to resume video if it was playing when delete modal was opened
  const pageRef = useRef(1);
  const plLengthRef = useRef(0);

  const PlaylistPlayerRef = useRef<YouTube | null>(null);
  const isPlayingVideoRef = useRef<boolean | null>(false);
  const allVideosIdsRef = useRef<string[]>([]);

  const router = useRouter();
  const queryClient = useQueryClient();

  const playlistId = params.list;
  const item = `pl=${playlistId}`;

  let plVideos: PlVideos = { videosIds: [] };
  let isBrowser = typeof window !== "undefined";
  let isChannel = false;

  if (isBrowser) {
    isChannel = JSON.parse(localStorage.getItem(item) || "[]")?.isChannel || false;
    const savedData = localStorage.getItem(`plVideos=${playlistId}`);

    if (savedData) {
      plVideos = JSON.parse(savedData);
    }
  }

  let allIds = plVideos?.videosIds || [];
  let playlistIsInStorage = plVideos?.videosIds?.length;
  let smallerThan200 = plVideos.updatedTime && allIds.length == 0;

  let olderThan1day = Date.now() - (plVideos.updatedTime || 0) > 24 * 60 * 60 * 1000;
  let olderThan3days = Date.now() - (plVideos.updatedTime || 0) > 3 * 24 * 60 * 60 * 1000;

  // let olderThan1day = Date.now() - (plVideos.updatedTime || 0) > 40000; // to test
  // let olderThan3days = Date.now() - (plVideos.updatedTime || 0) > 40000; // to test

  useEffect(() => {
    async function run() {
      if (playlistIsInStorage) {
        if (smallerThan200 && olderThan3days) {
          // if the playlist is small and older re-check the size
          const playlistLength = await getPlaylistSize(playlistId);
          plLengthRef.current = playlistLength;

          if (playlistLength > 200) {
            await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
          } else {
            localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ updatedTime: Date.now() }));
          }
        } else if (allIds.length && olderThan1day) {
          // if the playlist is bigger than 200 and older re-fetch new videos
          plLengthRef.current = allIds.length;

          const data = await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
          plLengthRef.current = data?.length || allIds;

          setCurrentVideoIndex((prev) => prev); // Forces re-render so the ref above updates the UI
        } else if (allIds.length && !olderThan1day) {
          // if the playlist is saved and recent than 1 day, just set the length
          allVideosIdsRef.current = allIds;
          plLengthRef.current = allIds.length;
        } else if (!allIds.length) {
          // if the playlist is small and not old, just set the length
          const pl = await PlaylistPlayerRef.current?.internalPlayer.getPlaylist();
          plLengthRef.current = pl.length;
        }
      } else {
        // New playlist
        const playlistLength = await getPlaylistSize(playlistId);
        plLengthRef.current = playlistLength;

        if (playlistLength > 200) {
          await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
        } else {
          localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ updatedTime: Date.now() }));
        }
      }
    }
    run();
  }, []);

  useEffect(() => {
    const player = PlaylistPlayerRef.current?.internalPlayer; // returns the iframe video player

    const timer = setInterval(() => {
      if (isPlayingVideoRef.current) {
        savePlaylistsProgress(player, playlistId, pageRef.current);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  function onReady(e: YouTubeEvent) {
    setIsLoaded(true);

    const plRate = JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
    PlaylistPlayerRef.current?.internalPlayer.setPlaybackRate(plRate);

    const intervalId = setInterval(() => {
      if (isPlayingVideoRef.current) {
        savePlaylistsProgress(e.target, playlistId, pageRef.current);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }

  function onPlay(e: YouTubeEvent) {
    isPlayingVideoRef.current = true;
    savePlaylistsProgress(e.target, playlistId, pageRef.current);
  }

  async function onPause(e: YouTubeEvent) {
    savePlaylistsProgress(e.target, playlistId, pageRef.current);
  }
  async function onError(e: YouTubeEvent) {
    pageRef.current = 1;
    let data = {
      playlistId,
      currentItem: 0,
      initialTime: 1,
      currentPage: 1,
      playbackSpeed: 1,
    };
    setTimeout(async () => {
      let state = e.target.getPlayerState();
      if (state == -1) {
        localStorage.setItem(`pl=${playlistId}`, JSON.stringify(data));
        await resetPlaylist();
      } else {
        e.target.playVideo();
      }
    }, 1000);
  }

  async function onStateChange(e: YouTubeEvent) {
    const index = (await e.target.getPlaylistIndex()) + 1 + (pageRef.current - 1) * 200;
    setCurrentVideoIndex(index);
  }

  async function onEnd(e: YouTubeEvent) {
    const currentIndex = e.target.getPlaylistIndex();

    if (currentIndex < e.target.getPlaylist().length - 1) {
      // e.target.nextVideo();

      e.target.playVideoAt(currentIndex + 1);
      e.target.seekTo(0);
    }
    if ((currentIndex + 1) % 200 === 0 && plLengthRef.current > 200) {
      // if the index is 199, 399, 599, etc. and videosIds  has more than 200 , 400, 600, etc. videos
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      await loadPlaylist(e.target, allVideosIdsRef.current, nextPage);
    }
  }

  function onSpeedChange(e: YouTubeEvent) {
    const currentData = JSON.parse(localStorage.getItem(item) || "[]");
    currentData.playbackSpeed = e.data;

    localStorage.setItem(item, JSON.stringify(currentData));
  }

  async function previousVideo() {
    const player = PlaylistPlayerRef.current?.getInternalPlayer();
    const index = await player.getPlaylistIndex();

    if (plLengthRef.current > 200) {
      if (index === 0 && pageRef.current > 1) {
        pageRef.current -= 1;
        await loadPlaylist(player, allVideosIdsRef.current, pageRef.current, 199);
      } else {
        // player.previousVideo();
        player.playVideoAt(index - 1);
        player.seekTo(0);
      }
    } else {
      // player.previousVideo();
      player.playVideoAt(index - 1);
      player.seekTo(0);
    }
  }
  async function nextVideo() {
    const player = PlaylistPlayerRef.current?.getInternalPlayer();
    const index = await player.getPlaylistIndex();

    if (plLengthRef.current > 200) {
      if ((index + 1) % 200 === 0) {
        pageRef.current += 1;

        await loadPlaylist(player, allVideosIdsRef.current, pageRef.current);
      } else {
        // player.nextVideo();
        player.playVideoAt(index + 1);
        player.seekTo(0);
      }
    } else {
      // player.nextVideo();
      player.playVideoAt(index + 1);
      player.seekTo(0);
    }
  }

  async function resetPlaylist() {
    pageRef.current = 1;
    await loadPlaylist(PlaylistPlayerRef.current?.getInternalPlayer(), allVideosIdsRef.current, pageRef.current, 0);
    setCurrentVideoIndex(1);
  }

  let playlistInfo = { currentItem: 0, initialTime: 0, currentPage: 0, isChannel: false };

  if (isBrowser) {
    playlistInfo = JSON.parse(localStorage.getItem(item) || JSON.stringify({ currentItem: 0, initialTime: 0, currentPage: 1, isChannel: false }));
  }

  const { currentItem, initialTime, currentPage } = playlistInfo;

  const plOptions: YouTubeProps["opts"] = useMemo(() => {
    pageRef.current = currentPage || 1;
    return {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        listType: "playlist",
        index: currentItem + 1,
        start: Math.floor(initialTime) || 0 || 1,
        origin: window?.location?.origin || "http://localhost:3000",
      },
    };
  }, []);

  if (pageRef.current > 1 || isChannel) {
    plOptions.playerVars.playlist = getVideosSlice(allIds, pageRef.current).join(",");
  } else {
    plOptions.playerVars.list = playlistId;
  }

  function onDelete() {
    onDeleteItems(playlistId, "playlists");

    queryClient.setQueryData<Items>(["playlists"], (oldData) => {
      if (oldData) {
        return {
          ...oldData,
          items: oldData.items.filter((pl) => pl.id !== playlistId),
        };
      }
      return oldData;
    });

    isPlayingVideoRef.current = null;
    router.replace("/");
  }

  async function openModal() {
    PlaylistPlayerRef.current?.internalPlayer.pauseVideo();
    isPaused.current = (await PlaylistPlayerRef?.current?.internalPlayer.getPlayerState()) === 2;

    setIsModalOpen(!isModalOpen);
  }

  // called when cancel or backdrop is clicked
  function onCancel() {
    if (!isPaused.current) {
      PlaylistPlayerRef.current?.internalPlayer.playVideo();
      isPaused.current = false;
    }

    setIsModalOpen(false);
  }

  let playlistTitle = reduceStringSize(params.title, 100);

  return (
    <>
      <LogoButton />
      <div className="flex h-screen max-h-full flex-col items-center justify-center pt-5">
        <div className="videoPlayer flex w-full min-w-[400px] items-center justify-center p-[0.15rem] pt-2 xl:pt-0 2xl:max-w-[75vw]">
          {!isLoaded && (
            <div role="status" className="-mt-20 flex items-center justify-center">
              <Icons.spinIcon className="mt-5 h-7 w-7 animate-spin text-blue-500 " />
              <span className="sr-only">Loading...</span>
            </div>
          )}
          <div className={`${isLoaded ? "visible" : "hidden"} relative w-full overflow-hidden pb-[56.25%] `}>
            <YouTube
              ref={PlaylistPlayerRef}
              opts={plOptions}
              onReady={onReady}
              onPlay={onPlay}
              onPause={onPause}
              onEnd={onEnd}
              onError={onError}
              onStateChange={onStateChange}
              onPlaybackRateChange={onSpeedChange}
              className="absolute left-0 right-0 top-0 h-full w-full border-none"
            />
          </div>
        </div>
        {isLoaded && (
          <div className="flex max-w-[80vw] flex-col-reverse">
            {/* Title */}
            <span className="text-balance break-words text-center tracking-wide text-neutral-800 dark:text-neutral-200 sm:mt-0">{playlistTitle}</span>
            {/* Menu Buttons */}
            <div className="flex items-center justify-center gap-1 py-1 xs:gap-3">
              <button
                className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={resetPlaylist}
              >
                <Icons.resetIcon className="h-8 w-8" />
              </button>
              <button
                className=" cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, -10)}
              >
                <Icons.rewind10 className="h-8 w-8" />
              </button>
              <button
                className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={previousVideo}
              >
                <Icons.pointerLeft className="h-8 w-8" />
              </button>
              <button
                className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={nextVideo}
              >
                <Icons.pointerRight className="h-8 w-8" />
              </button>
              <button
                className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, 10)}
              >
                <Icons.skip10 className="h-8 w-8" />
              </button>

              <span className="min-w-[4rem] text-xl text-neutral-600 dark:text-[#818386]">
                {currentVideoIndex} / {plLengthRef.current}
              </span>
              <button
                className="cursor-pointer pl-1 text-neutral-600 outline-none transition duration-300 hover:text-red-500 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-red-500"
                onClick={openModal}
              >
                <Icons.closeIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {isModalOpen && (
          <ModalDelete
            onClose={onCancel}
            content={<DeleteModalContent type="Playlist" id={playlistId} title={params.title} openModal={onCancel} onDelete={onDelete} />}
          />
        )}
      </div>
    </>
  );
}
