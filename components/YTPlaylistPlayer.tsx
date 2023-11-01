"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import type { Items, PlVideos, PlaylistAPI } from "@/types";
import { Icons } from "@/assets/Icons";

import fetchVideosIds from "@/utils/fetchVideosIds";
import getVideosSlice from "@/utils/getVideosSlice";
import seekTime from "@/utils/seekTime";
import LogoButton from "./LogoButton";
import savePlaylistsProgress from "@/utils/savePlaylistProgress";
import loadPlaylist from "@/utils/loadPlaylist";
import DeleteModalContent from "./modals/DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";
import onDeleteItems from "@/utils/onDeleteItem";
import reduceStringSize from "@/utils/reduceStringLength";
import Description from "./Description";
import Tooltip from "./ToolTip";
import { del, get, set } from "idb-keyval";
import VideosListSidebar from "./VideosListSidebar";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Params = {
  list: string;
  title: string;
};

export default function YoutubePlayer({ params }: { params: Params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(1);
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");

  const [description, setDescription] = useState<string | null>(null);
  const [videosList, setVideosList] = useState<Items["items"]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  const isPaused = useRef(false); // used to resume video if it was playing when delete modal was opened
  const pageRef = useRef(1);
  const plLengthRef = useRef(0);
  const currentVideoId = useRef(0);

  const PlaylistPlayerRef = useRef<YouTube | null>(null);
  const isPlayingVideoRef = useRef<boolean | null>(false);
  const videosIdsRef = useRef<string[]>([]);

  const queryClient = useQueryClient();
  const router = useRouter();

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

  let playlistInfo = { currentItem: 0, initialTime: 0, currentPage: 0, isChannel: false };

  if (isBrowser) {
    playlistInfo = JSON.parse(localStorage.getItem(item) || JSON.stringify({ currentItem: 0, initialTime: 0, currentPage: 1, isChannel: false }));
  }
  const { currentItem, initialTime, currentPage } = playlistInfo;

  videosIdsRef.current = plVideos?.videosIds || [];
  plLengthRef.current = videosIdsRef.current.length;

  let olderThan1day = Date.now() - (plVideos.updatedTime || 0) > 24 * 60 * 60 * 1000;
  // let olderThan1day = Date.now() - (plVideos.updatedTime || 0) > 20000; // to test

  useEffect(() => {
    async function run() {
      const shouldFetch = !videosIdsRef.current.length || olderThan1day;

      if (shouldFetch) {
        const data = await fetchVideosIds(playlistId, videosIdsRef, isChannel);
        plLengthRef.current = data?.length;
        await set(`pl=${playlistId}`, data);
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

  async function onReady(e: YouTubeEvent) {
    setIsLoaded(true);

    const plRate = JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
    PlaylistPlayerRef.current?.internalPlayer.setPlaybackRate(plRate);

    setCurrentVideoTitle(e.target.getVideoData().title || "");

    const index = (await PlaylistPlayerRef.current?.internalPlayer?.getPlaylistIndex()) + 1 + (pageRef.current - 1) * 200;
    setCurrentVideoIndex(index);

    let vidsData = await get(`pl=${playlistId}`);
    if (vidsData) setVideosList(vidsData);

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
      let state = e.target?.getPlayerState();
      if (state == -1) {
        localStorage.setItem(`pl=${playlistId}`, JSON.stringify(data));
        await resetPlaylist();
        await PlaylistPlayerRef.current?.resetPlayer();
      } else {
        e.target.playVideo();
      }
    }, 1000);
  }

  async function onStateChange(e: YouTubeEvent) {
    const index = (await e.target.getPlaylistIndex()) + 1 + (pageRef.current - 1) * 200;
    setCurrentVideoIndex(index);
    setCurrentVideoTitle(e.target.getVideoData().title || "");

    setCurrentTime(e.target.getCurrentTime());

    let videoId = e.target.getVideoData().video_id;
    currentVideoId.current = videoId;
    let pl = await get(`pl=${playlistId}`);

    const desc = pl?.find((v: PlaylistAPI) => v.id === videoId)?.description;
    setDescription(desc);
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
      await loadPlaylist(e.target, videosIdsRef.current, nextPage);
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
        await loadPlaylist(player, videosIdsRef.current, pageRef.current, 199);
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

        await loadPlaylist(player, videosIdsRef.current, pageRef.current);
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
  async function playVideoAt(index: number) {
    const player = PlaylistPlayerRef.current?.getInternalPlayer();

    pageRef.current = Math.floor(index / 200) + 1;
    const paginatedIndex = index % 200;
    await loadPlaylist(player, videosIdsRef.current, pageRef.current, paginatedIndex);
  }

  async function resetPlaylist() {
    pageRef.current = 1;
    await loadPlaylist(PlaylistPlayerRef.current?.getInternalPlayer(), videosIdsRef.current, pageRef.current, 0);
    setCurrentVideoIndex(1);
  }

  async function onDelete() {
    isPlayingVideoRef.current = null;
    router.replace("/");

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

    await del(item);
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
        origin: isBrowser ? window.location?.origin : "https://localhost:3000",
      },
    };
  }, []);

  plOptions.playerVars.playlist = getVideosSlice(videosIdsRef.current, pageRef.current).join(",");

  let playlistTitle = reduceStringSize(params.title, 100);

  const isSmaller = useMediaQuery("(max-width: 1280px)");
  return (
    <>
      <LogoButton />
      <div className="flex flex-col items-center justify-center pt-12">
        <div className="videoPlayer flex w-full min-w-[400px] items-center justify-center p-[0.15rem] pt-2 xl:max-w-[62vw] xl:pt-0 2xl:max-w-[70vw]">
          <div className=" relative w-full overflow-auto pb-[56.25%]">
            {!isLoaded && (
              <div className="absolute inset-0 -ml-4 -mt-1 flex flex-col items-center justify-center">
                <Icons.spinIcon className="h-7 w-7 animate-spin text-indigo-500" />
                <span className="sr-only">Loading...</span>
              </div>
            )}

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
              className={`${isLoaded ? "visible" : "hidden"}  absolute left-0 right-0 top-0 h-full w-full border-none`}
            />
          </div>

          {!isSmaller && <VideosListSidebar videosList={videosList} playVideoAt={playVideoAt} currentVideoIndex={currentVideoIndex} className="xl:absolute" />}
        </div>
        {isLoaded && (
          <div className="flex max-w-[80vw] flex-col  pt-1 md:max-w-[60vw] 2xl:max-w-[65vw] 2xl:pt-2">
            <div className="flex justify-center gap-1 py-2 xs:gap-3 sm:py-0">
              <Tooltip text="Restart Playlist">
                <button
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                  onClick={resetPlaylist}
                >
                  <Icons.resetIcon className="h-8 w-8" />
                </button>
              </Tooltip>
              <Tooltip text="Rewind 10s">
                <button
                  className=" cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                  onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, -10)}
                >
                  <Icons.rewind10 className="h-8 w-8" />
                </button>
              </Tooltip>
              <Tooltip text="Previous Video">
                <button
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                  onClick={previousVideo}
                >
                  <Icons.pointerLeft className="h-8 w-8" />
                </button>
              </Tooltip>
              <Tooltip text="Next Video">
                <button
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                  onClick={nextVideo}
                >
                  <Icons.pointerRight className="h-8 w-8" />
                </button>
              </Tooltip>
              <Tooltip text="Skip 10s">
                <button
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                  onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, 10)}
                >
                  <Icons.skip10 className="h-8 w-8" />
                </button>
              </Tooltip>
              <Tooltip text="Open on Youtube">
                <Link
                  href={`https://www.youtube.com/watch?v=${currentVideoId.current}&list=${playlistId}&t=${Math.floor(currentTime)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icons.youtubeOpen className="ml-[0.15rem] h-8 w-8 fill-neutral-200 px-[0.075rem]  text-neutral-600 transition duration-300  hover:text-neutral-950 dark:fill-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200" />
                </Link>
              </Tooltip>
              <span className="min-w-[3.5rem] whitespace-nowrap px-1 pt-[0.15rem] text-xl text-neutral-600 dark:text-[#818386]">
                {currentVideoIndex} / {plLengthRef.current}
              </span>
              <Tooltip text="Delete Playlist">
                <button
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-red-500 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-red-500"
                  onClick={openModal}
                >
                  <Icons.closeIcon className="h-8 w-8 " />
                </button>
              </Tooltip>
            </div>
            {/* Title */}
            {currentVideoTitle && (
              <span className="flex justify-center break-words pb-5 text-center tracking-wide text-neutral-800 dark:text-neutral-200 max-2xl:-mt-1 2xl:pb-0 ">
                {currentVideoTitle} - {playlistTitle}
              </span>
            )}

            {description && <Description description={description} />}
            <div>{isSmaller && <VideosListSidebar videosList={videosList} playVideoAt={playVideoAt} currentVideoIndex={currentVideoIndex} />}</div>
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
