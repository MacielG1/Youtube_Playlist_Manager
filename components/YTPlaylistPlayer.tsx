"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { Items, PlVideos, PlaylistInfo } from "@/types";
import { Icons } from "@/assets/Icons";

import fetchVideosIds from "@/utils/fetchVideosIds";
import getPlaylistSize from "@/utils/getPlaylistSize";
import getVideosSlice from "@/utils/getVideosSlice";
import seekTime from "@/utils/seekTime";
import BackButton from "./BackButton";
import savePlaylistsProgress from "@/utils/savePlaylistProgress";
import loadPlaylist from "@/utils/loadPlaylist";
import DeleteModalContent from "./modals/DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";

type Params = {
  list: string;
  title: string;
};

export default function YoutubePlayer({ params }: { params: Params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(1);

  const router = useRouter();
  const queryClient = useQueryClient();

  const pageRef = useRef(1);
  const playlistLengthRef = useRef(0);
  const PlaylistPlayerRef = useRef<YouTube | null>(null);
  const playingVideoRef = useRef<boolean | null>(false);
  const allVideosIdsRef = useRef<string[]>([]);

  const playlistId = params.list;
  const item = `pl=${playlistId}`;

  let plVideos: PlVideos = {
    videosIds: [],
  };

  if (typeof window !== "undefined") {
    const savedData = localStorage.getItem(`plVideos=${playlistId}`);
    if (savedData) {
      plVideos = JSON.parse(savedData);
    }
  }

  let allIds = plVideos?.videosIds || [];

  useEffect(() => {
    async function run() {
      if (plVideos?.videosIds?.length) {
        console.log("Playlist Already in Storage");
        // if the playlist is already in local storage
        let hasOnlyDate = plVideos.updatedTime && allIds.length == 0;

        let recentThan1day = Date.now() - (plVideos.updatedTime || 0) < 24 * 60 * 60 * 1000; // 1 day
        let recentThan3days = Date.now() - (plVideos.updatedTime || 0) < 3 * 24 * 60 * 60 * 1000; // 3 days
        // let recentThan1MIn = Date.now() - plVideos.updatedTime < 60 * 1000; // 1 min

        if (hasOnlyDate && !recentThan3days) {
          console.log("hasOnlyDate, but older than 3 days");
          // if hasOnlyData is true the playlist was already added to storage but is smaller than 200 videos

          const playlistLength = await getPlaylistSize(playlistId);
          playlistLengthRef.current = playlistLength;

          if (playlistLength > 200) {
            // if it became bigger than 200 videos, fetch the new ids
            await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
          } else {
            localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ updatedTime: Date.now() }));
          }
        } else if (allIds.length && !recentThan1day) {
          // if the playlist is in Storage and longer than 1 day: fetch the new videos

          await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
          playlistLengthRef.current = allVideosIdsRef.current.length;
        } else if (allIds.length && recentThan1day) {
          // if the playlist is in Storage and recent than 1 day: take the length from the storage
          allVideosIdsRef.current = allIds;
          playlistLengthRef.current = allIds.length;
        } else if (!allIds.length) {
          // if the playlist is small take the length from the player
          const pl = await PlaylistPlayerRef.current?.internalPlayer.getPlaylist();
          playlistLengthRef.current = pl.length;
        }
      } else {
        // if it's a new playlist

        const playlistLength = await getPlaylistSize(playlistId);
        playlistLengthRef.current = playlistLength;

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
    const player = PlaylistPlayerRef.current?.internalPlayer; // returns the iframe video  player

    const timer = setInterval(() => {
      if (playingVideoRef.current) {
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
      if (playingVideoRef.current) {
        savePlaylistsProgress(e.target, playlistId, pageRef.current);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }

  function onPlay(e: YouTubeEvent) {
    playingVideoRef.current = true;
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
    if ((currentIndex + 1) % 200 === 0 && playlistLengthRef.current > 200) {
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

    if (playlistLengthRef.current > 200) {
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

    if (playlistLengthRef.current > 200) {
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

  let playlistInfo: PlaylistInfo;

  if (typeof window !== "undefined") {
    playlistInfo = JSON.parse(localStorage.getItem(item) || JSON.stringify({ currentItem: 0, initialTime: 0, currentPage: 1 }));
  } else {
    playlistInfo = { currentItem: 0, initialTime: 0, currentPage: 0 };
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
        origin: window.location.origin,
      },
    };
  }, []);

  if (pageRef.current > 1) {
    plOptions.playerVars.playlist = getVideosSlice(allIds, pageRef.current).join(",");
  } else {
    plOptions.playerVars.list = playlistId;
  }

  function onDelete() {
    localStorage.removeItem(`pl=${playlistId}`);
    localStorage.removeItem(`plVideos=${playlistId}`);

    // remove playlist from playlists array
    const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    const newPlaylists = allPlaylists.filter((pl: string) => pl !== playlistId);

    localStorage.setItem("playlists", JSON.stringify(newPlaylists));

    queryClient.setQueryData<Items>(["playlists"], (oldData) => {
      if (oldData) {
        return {
          ...oldData,
          items: oldData.items.filter((pl) => pl.id !== playlistId),
        };
      }
      return oldData;
    });

    playingVideoRef.current = null;
    router.replace("/");
  }

  function openModal() {
    PlaylistPlayerRef.current?.internalPlayer.pauseVideo();
    setIsModalOpen(!isModalOpen);
  }

  return (
    <>
      <BackButton />
      <div className="flex flex-col justify-center h-screen items-center  ">
        {!isLoaded && (
          <div role="status" className="flex justify-center items-center h-[25vh] md:h-[70vh]">
            <Icons.spinIcon className="h-7 w-7 mt-5 text-blue-500 animate-spin " />
            <span className="sr-only">Loading...</span>
          </div>
        )}
        <div className="w-full min-w-[400px] max-w-[95vw] md:max-w-[750px]  lg:max-w-[800px] xl:max-w-[1000px] 2xl:max-w-[1300px] -mt-20 sm:mt-0 pt-2 xl:pt-0 flex justify-center items-center">
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
              className="absolute top-0 left-0 right-0 w-full h-full border-none"
            />
          </div>
        </div>

        {isLoaded && (
          <div className="flex gap-3 justify-center items-center my-2">
            <button className=" cursor-pointer text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none  " onClick={resetPlaylist}>
              <Icons.resetIcon className="h-8 w-8" />
            </button>
            <button
              className=" text-neutral-400  cursor-pointer  duration-300 hover:text-neutral-500 transition  outline-none focus:text-neutral-500"
              onClick={() => seekTime(playingVideoRef, PlaylistPlayerRef, -10)}
            >
              <Icons.rewind10 className="h-8 w-8" />
            </button>
            <button className=" cursor-pointer text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none " onClick={previousVideo}>
              <Icons.pointerLeft className="w-8 h-8" />
            </button>
            <button className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500" onClick={nextVideo}>
              <Icons.pointerRight className="w-8 h-8" />
            </button>
            <button
              className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500"
              onClick={() => seekTime(playingVideoRef, PlaylistPlayerRef, 10)}
            >
              <Icons.skip10 className="h-8 w-8" />
            </button>

            <span className="pl-3 min-w-[5rem] text-xl text-[#7b7e83]">
              {currentVideoIndex} / {playlistLengthRef.current}
            </span>
            <button className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500" onClick={openModal}>
              <Icons.closeIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        {isModalOpen && (
          <ModalDelete
            onClose={openModal}
            content={<DeleteModalContent type="Playlist" id={playlistId} title={params.title} openModal={openModal} onDelete={onDelete} />}
          />
        )}
      </div>
    </>
  );
}
