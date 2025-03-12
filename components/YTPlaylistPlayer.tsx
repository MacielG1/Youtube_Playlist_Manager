"use client";
import type { Items, PlVideos, Playlist, PlaylistAPI } from "@/types";
import { useRef, useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import YouTube, { type YouTubeEvent, type YouTubeProps } from "react-youtube";
import { useAudioToggle } from "@/providers/SettingsProvider";
import { shuffle } from "@/utils/shuffle";
import { del, get, set } from "idb-keyval";
import { useMediaQuery } from "usehooks-ts";
import fetchVideosIds from "@/utils/fetchVideosIds";
import getVideosSlice from "@/utils/getVideosSlice";
import seekTime from "@/utils/seekTime";
import LogoButton from "./LogoButton";
import savePlaylistsProgress from "@/utils/savePlaylistProgress";
import loadPlaylist from "@/utils/loadPlaylist";
import ModalDelete from "./modals/ModalDelete";
import onDeleteItems from "@/utils/onDeleteItem";
import reduceStringSize from "@/utils/reduceStringLength";
import Description from "./Description";
import VideosListSidebar from "./VideosListSidebar";
import Link from "next/link";
import Spin from "@/assets/icons/Spin";
import Rewind10 from "@/assets/icons/Rewind10";
import PointerLeft from "@/assets/icons/PointerLeft";
import PointerRight from "@/assets/icons/PointerRight";
import Skip10 from "@/assets/icons/Skip10";
import Youtube from "@/assets/icons/Youtube";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ToolTip";
import Shuffle from "@/assets/icons/Shuffle";
import VideoDate from "./VideoDate";
import RemoveVideo from "@/assets/icons/RemoveVideo";
import ResetPlaylistModal from "./modals/ResetPlaylistModal";
import Close from "@/assets/icons/Close";
import toast, { type Toast } from "react-hot-toast";
import { toastRefresh } from "@/utils/toastStyles";
import Reset from "@/assets/icons/Reset";

export default function YoutubePlayer({ params }: { params: { list: string; title: string } }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number | null>(null);
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const [hasValidVideoIds, setHasValidVideoIds] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  const [description, setDescription] = useState<string | null>(null);
  const [videosList, setVideosList] = useState<Items["items"]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { isAudioMuted } = useAudioToggle();
  const isPaused = useRef(false);
  const pageRef = useRef(1);
  const plLengthRef = useRef(0);
  const currentVideoId = useRef(0);
  const pageAndIndexBeforeShuffle = useRef({ page: 1, index: 0 });

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

    if (savedData) plVideos = JSON.parse(savedData);
  }

  let playlistInfo = { currentItem: 0, initialTime: 0, currentPage: 0, isChannel: false };

  if (isBrowser) {
    playlistInfo = JSON.parse(localStorage.getItem(item) || JSON.stringify({ currentItem: 0, initialTime: 0, currentPage: 1, isChannel: false }));
  }
  const { currentItem, initialTime, currentPage } = playlistInfo;

  videosIdsRef.current = plVideos?.videosIds || [];
  plLengthRef.current = videosIdsRef.current.length;

  let olderThan1day = Date.now() - (plVideos.updatedTime || 0) > 10 * 60 * 60 * 1000; // 10 hours
  // let olderThan1day = Date.now() - (plVideos.updatedTime || 0) > 20000; // 20s to test

  useEffect(() => {
    async function run() {
      setIsLoading(true);
      try {
        const data = await get(`pl=${playlistId}`);
        if (!data) {
          console.log("No playlist data found");
          setIsLoading(false);
          return;
        }

        plLengthRef.current = data.length;
        videosIdsRef.current = data.map((video: PlaylistAPI) => video.id);

        if (videosIdsRef.current.length > 0) {
          setHasValidVideoIds(true);
        }
      } catch (error) {
        console.error("Error loading playlist data:", error);
      } finally {
        setIsLoading(false);
        setIsInitialFetchDone(true);
      }
    }
    run();
  }, []);

  useEffect(() => {
    if (PlaylistPlayerRef?.current) {
      try {
        isAudioMuted ? PlaylistPlayerRef.current.internalPlayer?.mute() : PlaylistPlayerRef.current.internalPlayer?.unMute();
      } catch (error) {
        console.error("Error setting mute state:", error);
      }
    }
  }, [isAudioMuted]);

  useEffect(() => {
    const player = PlaylistPlayerRef.current?.internalPlayer;
    if (!player) return;

    const timer = setInterval(() => {
      if (isPlayingVideoRef.current && !isShuffled && player) {
        try {
          savePlaylistsProgress(player, playlistId, pageRef.current);
        } catch (error) {
          console.error("Error saving playlist progress:", error);
        }
      }
    }, 15000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function onReady(e: YouTubeEvent) {
    try {
      if (!e.target) return;

      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const videoData = e.target.getVideoData();
        if (videoData && videoData.title) {
          setCurrentVideoTitle(videoData.title);
        }
      } catch (err) {
        console.warn("Could not get video title:", err);
      }

      const player = PlaylistPlayerRef.current?.internalPlayer;
      if (!player) {
        console.warn("Player not initialized in onReady");
        return;
      }

      try {
        const playlistIndex = await player.getPlaylistIndex();
        if (typeof playlistIndex === "number") {
          const index = playlistIndex + 1 + (pageRef.current - 1) * 200;
          setCurrentVideoIndex(index);
        }
      } catch (err) {
        console.warn("Could not get playlist index:", err);
      }

      const vidsData = await get(`pl=${playlistId}`);
      if (vidsData) setVideosList(vidsData);

      try {
        const plRate = JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
        await player.setPlaybackRate(plRate);
      } catch (err) {
        console.warn("Could not set playback rate:", err);
      }

      const intervalId = setInterval(() => {
        if (isPlayingVideoRef.current && !isShuffled && e.target) {
          try {
            savePlaylistsProgress(e.target, playlistId, pageRef.current);
          } catch (error) {
            console.error("Error saving playlist progress in interval:", error);
          }
        }
      }, 15000);

      return () => clearInterval(intervalId);
    } catch (error) {
      console.error("Error in onReady:", error);
    }
  }

  async function onPlay(e: YouTubeEvent) {
    try {
      if (!e.target) return;
      isPlayingVideoRef.current = true;
      if (!isShuffled) savePlaylistsProgress(e.target, playlistId, pageRef.current);
    } catch (error) {
      console.error("Error in onPlay:", error);
    }
  }

  async function onPause(e: YouTubeEvent) {
    try {
      if (!e.target) return;
      if (!isShuffled) savePlaylistsProgress(e.target, playlistId, pageRef.current);
    } catch (error) {
      console.error("Error in onPause:", error);
    }
  }

  async function onError(e: YouTubeEvent) {
    console.log("error", e);

    // YouTube error code 101 or 150 indicates embedding is disabled
    if (e.data === 101 || e.data === 150) {
      setEmbedError(true);
    }

    if (e.data == 150) {
      const savedData = JSON.parse(localStorage.getItem(item) || "[]");
      const currentIndex = await e.target.getPlaylistIndex();

      const index = currentIndex + 1 + (savedData.currentPage - 1) * 200;

      setCurrentVideoIndex(index);
      if (index > plLengthRef.current) {
        return resetPlaylist();

      } else if (e.target.playerInfo?.playerState < 0 && e.data !== 101 && e.data !== 150) {
        toast(
          (t: Toast) => (
            <div className="flex items-center gap-2">
              <span>Error, Please refresh!</span>
              <span
                onClick={() => {
                  window.location.reload();
                  toast.dismiss(t.id);
                }}
                className="cursor-pointer rounded-sm bg-indigo-600 px-2 py-1 text-sm text-white hover:bg-indigo-600"
              >
                Refresh
              </span>
            </div>
          ),
          toastRefresh,
        );
      }
    }
  }

  async function onStateChange(e: YouTubeEvent) {
    try {
      if (!e.target) return;

      // -1 (unstarted)
      // 0 (ended)
      // 1 (playing)
      // 2 (paused)
      // 3 (buffering)
      // 5 (video cued)

      const index = (await e.target.getPlaylistIndex()) + 1 + (pageRef.current - 1) * 200;
      if (e.data === 1) {
        setCurrentVideoIndex(index);
        if (embedError) setEmbedError(false);
      }

      const title = e.target.getVideoData()?.title;
      if (title) setCurrentVideoTitle(title);
      setCurrentTime(e.target.getCurrentTime());

      let videoId = e.target.getVideoData()?.video_id;
      if (!videoId) return;

      currentVideoId.current = videoId;
      let pl = await get(`pl=${playlistId}`);

      const video = pl?.find((v: PlaylistAPI) => v.id === videoId);
      if (!video) return;
      setDescription(video.description);
      setPublishedAt(video.publishedAt);
    } catch (error) {
      console.error("Error in onStateChange:", error);
    }
  }

  async function onEnd(e: YouTubeEvent) {
    try {
      if (!e.target) return;

      const currentIndex = await e.target.getPlaylistIndex();
      const playlist = await e.target.getPlaylist();

      if (!playlist) return;

      if (currentIndex < playlist.length - 1) {
        e.target.playVideoAt(currentIndex + 1);
        e.target.seekTo(0);
      }

      if ((currentIndex + 1) % 200 === 0 && plLengthRef.current > 200) {
        const nextPage = pageRef.current + 1;
        pageRef.current = nextPage;
        await loadPlaylist(e.target, videosIdsRef.current, nextPage);
      }
    } catch (error) {
      console.error("Error in onEnd:", error);
    }
  }

  function onSpeedChange(e: YouTubeEvent) {
    const currentData = JSON.parse(localStorage.getItem(item) || "[]");
    currentData.playbackSpeed = e.data;

    localStorage.setItem(item, JSON.stringify(currentData));
  }

  async function previousVideo() {
    try {
      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (!player) return;

      const index = await player.getPlaylistIndex();

      if (plLengthRef.current > 200 && index === 0 && pageRef.current > 1) {
        pageRef.current -= 1;
        await loadPlaylist(player, videosIdsRef.current, pageRef.current, 199);
      } else {
        const targetIndex = index > 0 ? index - 1 : 0;
        await player.playVideoAt(targetIndex);
      }
    } catch (error) {
      console.error("Error in previousVideo:", error);
    }
  }

  async function nextVideo() {
    try {
      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (!player) return;

      const index = await player.getPlaylistIndex();

      if (plLengthRef.current > 200 && (index + 1) % 200 === 0) {
        pageRef.current += 1;
        await loadPlaylist(player, videosIdsRef.current, pageRef.current);
      } else {
        await player.nextVideo();
        await player.seekTo(0);
      }
    } catch (error) {
      console.error("Error in nextVideo:", error);
    }
  }

  async function nextVideoOnError() {
    try {
      const currentIndex = currentVideoIndex !== null ? currentVideoIndex : 0;
      const nextIndex = currentIndex + 1;

      if (nextIndex < plLengthRef.current) {
        setCurrentVideoIndex(nextIndex);
        await playVideoAt(nextIndex);
      } else {
        toast.error("No more videos in the playlist");
      }
    } catch (error) {
      console.error("Error in nextVideoOnError:", error);
    }
  }

  async function playVideoAt(index: number) {
    try {
      const player = PlaylistPlayerRef.current?.getInternalPlayer();
      if (!player) return;

      pageRef.current = Math.floor(index / 200) + 1;
      const paginatedIndex = index % 200;
      await loadPlaylist(player, videosIdsRef.current, pageRef.current, paginatedIndex);
    } catch (error) {
      console.error("Error in playVideoAt:", error);
    }
  }

  async function resetPlaylist(includeRemovedVideos = false) {
    try {
      pageRef.current = 1;

      if (includeRemovedVideos) {
        handleVideoPlayback("pause");
        setIsLoading(true);
        await del(`plRemoved=${playlistId}`);

        const newlyFetchedData = await fetchVideosIds(playlistId, videosIdsRef, isChannel);

        const videosIds = newlyFetchedData.map((video: PlaylistAPI) => video.id);
        plLengthRef.current = newlyFetchedData.length;
        videosIdsRef.current = videosIds;

        setVideosList(newlyFetchedData);

        await set(`pl=${playlistId}`, newlyFetchedData);

        localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ videosIds, updatedTime: Date.now() }));
      } else {
        const pl = await get(`pl=${playlistId}`);
        if (!pl) return;

        videosIdsRef.current = pl.map((video: PlaylistAPI) => video.id);
        plLengthRef.current = videosIdsRef.current.length;
      }

      await loadPlaylist(PlaylistPlayerRef.current?.getInternalPlayer(), videosIdsRef.current, pageRef.current, 0);
      await savePlaylistsProgress(PlaylistPlayerRef.current?.getInternalPlayer(), playlistId, 1);
      setCurrentVideoIndex(1);
    } catch (e) {
      console.log("error", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function removeVideo() {
    if (isRemoving) return;

    setIsRemoving(true);
    const player = PlaylistPlayerRef.current?.getInternalPlayer();

    if (!player) return setIsRemoving(false);

    const state = await player.getPlayerState();

    if (state === 5 || state === 3 || state === 0) return setIsRemoving(false);

    const currentIndex = await player.getPlaylistIndex();
    const currentPlaylist = await player.getPlaylist();
    const currentVideoId1 = currentPlaylist && currentPlaylist[currentIndex];

    let currentVidId = currentVideoId.current || currentVideoId1 || new URLSearchParams((await player.getVideoUrl()).split("?")[1]).get("v");

    if (!currentVidId) return setIsRemoving(false);

    const [pl = [], removedVideos = []] = await Promise.all([get(`pl=${playlistId}`), get(`plRemoved=${playlistId}`)]);
    const newPl = pl.filter((video: PlaylistAPI) => video.id !== currentVidId);
    const updatedRemovedVideos = [...removedVideos, currentVidId];

    await Promise.all([set(`pl=${playlistId}`, newPl), set(`plRemoved=${playlistId}`, updatedRemovedVideos)]);

    videosIdsRef.current = newPl.map((video: PlaylistAPI) => video.id);
    plLengthRef.current = videosIdsRef.current.length;
    currentVideoId.current = newPl[currentIndex ? currentIndex - 1 : 0].id;
    currentVidId = currentVideoId.current;

    const plVideos = JSON.parse(localStorage.getItem(`plVideos=${playlistId}`) || "{}");
    plVideos.videosIds = videosIdsRef.current;
    localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify(plVideos));

    if (plLengthRef.current === 0) await onDelete();
    else {
      await loadPlaylist(player, videosIdsRef.current, pageRef.current, currentIndex ? currentIndex - 1 : 0);

      setTimeout(async () => {
        const currentVideoIndex = newPl.findIndex((video: PlaylistAPI) => video.id === currentVidId);
        const currentVideo = newPl[currentVideoIndex !== -1 ? currentVideoIndex : 0];

        const url = await player.getVideoUrl();
        if (!url) return setIsRemoving(false);

        if (currentVideo.id !== currentVidId) {
          await loadPlaylist(player, videosIdsRef.current, pageRef.current, currentIndex ? currentIndex - 1 : 0);
        }
      }, 2000);
    }
    setVideosList(newPl);
    handleVideoPlayback("pause");

    setTimeout(() => {
      setIsRemoving(false);
    }, 1000);
  }

  async function onDelete() {
    isPlayingVideoRef.current = null;
    router.replace("/");

    onDeleteItems(playlistId, "playlists");
    await del(item);
    await del(`plRemoved=${playlistId}`);

    queryClient.setQueryData<Items>(["playlists"], (oldData: Items | undefined) => {
      if (oldData) {
        return {
          ...oldData,
          items: oldData.items.filter((pl: Playlist) => pl.id !== playlistId),
        };
      }
      return oldData;
    });
  }

  async function isVideoPaused() {
    try {
      const player = PlaylistPlayerRef.current?.internalPlayer;
      if (!player) return true;

      const playerState = await player.getPlayerState();
      return playerState === 2;
    } catch (error) {
      console.error("Error checking video pause state:", error);
      return true;
    }
  }

  async function handleVideoPlayback(mode: "play" | "pause") {
    try {
      const player = PlaylistPlayerRef.current?.internalPlayer;
      if (!player) return;

      const playerState = await player.getPlayerState();

      if (mode === "play" && playerState === 2) {
        await player.playVideo();
        isPaused.current = false;
      } else if (mode === "pause" && playerState === 1) {
        await player.pauseVideo();
        isPaused.current = true;
      }
    } catch (error) {
      console.error("Error handling video playback:", error);
    }
  }

  async function onShuffle() {
    const playerState = await PlaylistPlayerRef.current?.internalPlayer.getPlayerState();
    if ((playerState !== 1 && playerState !== 2) || !plLengthRef.current || !videosIdsRef.current.length || isShuffled) {
      return;
    }

    setIsShuffled(true);

    pageAndIndexBeforeShuffle.current = {
      page: pageRef.current,
      index: currentVideoIndex ? currentVideoIndex - 1 : 0,
    };

    const data = (await get(`pl=${playlistId}`)) as Playlist[];

    const shuffledVideos = shuffle(data);
    const shuffledIds = shuffledVideos.map((item) => item.id);

    videosIdsRef.current = shuffledIds;

    await loadPlaylist(PlaylistPlayerRef.current?.getInternalPlayer(), shuffledIds, 1, 0);
    setVideosList(shuffledVideos);
  }

  async function unShuffle() {
    setIsShuffled(false);

    const { page, index } = pageAndIndexBeforeShuffle.current;
    const data = (await get(`pl=${playlistId}`)) as Playlist[];

    videosIdsRef.current = data.map((item) => item.id);
    await loadPlaylist(PlaylistPlayerRef.current?.getInternalPlayer(), videosIdsRef.current, page, index);

    setVideosList(data);
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
        mute: isAudioMuted,
      },
    };
  }, []);

  plOptions.playerVars.playlist = getVideosSlice(videosIdsRef.current, pageRef.current).join(",");

  let playlistTitle = reduceStringSize(params.title, 100);

  const isSmaller = useMediaQuery("(max-width: 1280px)");

  if (!isMounted) return null;

  return (
    <>
      <LogoButton />
      <div className="flex flex-col items-center justify-center pt-12">
        <div className="videoPlayer flex w-full min-w-[400px] items-center justify-center p-[2.4px] pt-2 xl:max-w-[62vw] xl:pt-0 2xl:max-w-[70vw]">
          <div className="relative w-full overflow-auto pb-[56.25%]">
            {(isLoading || !isInitialFetchDone || !hasValidVideoIds) && (
              <div className="absolute inset-0 -mt-1 -ml-4 flex flex-col items-center justify-center">
                <Spin className="h-7 w-7 animate-spin text-indigo-500" />
                <span className="sr-only">Loading...</span>
              </div>
            )}
            {isInitialFetchDone && hasValidVideoIds && videosIdsRef.current.length > 0 && (
              <>
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
                  className="absolute top-0 right-0 left-0 h-full w-full border-none"
                />
                
                {embedError && (
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                    <div className="text-center">
                      <h2 className="mb-4 text-xl font-semibold text-neutral-800 dark:text-neutral-200">Video Unavailable</h2>
                      <p className="mb-6 text-neutral-600 dark:text-neutral-400">This video cannot be embedded due to the owner's settings.</p>
                      <div className="flex gap-4">
                        <button
                          onClick={() => window.location.reload()}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        > <Reset className="size-5" />
                        
                          Refresh
                        </button>
                        <button
                          onClick={nextVideoOnError}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        >
                          <PointerRight className="h-5 w-5" />
                          Next Video
                        </button>
                        <Link
                          href={`https://www.youtube.com/watch?v=${currentVideoId.current}&list=${playlistId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                          <Youtube className="h-5 w-5" />
                          Watch on YouTube
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {!isSmaller && <VideosListSidebar videosList={videosList} playVideoAt={playVideoAt} currentVideoIndex={currentVideoIndex} className="xl:absolute" />}
        </div>
        {!!plLengthRef.current && (
          <div className="flex max-w-[80vw] flex-col pt-1 md:max-w-[60vw] 2xl:max-w-[65vw] 2xl:pt-2">
            <div className="xs:gap-3 my-[4px] flex justify-center gap-1 py-2 max-md:flex-wrap sm:py-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <ResetPlaylistModal resetPlaylist={resetPlaylist} isVideoPaused={isVideoPaused} handleVideoPlayback={handleVideoPlayback} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Restart Playlist</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="-mr-[6px] flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, -10)}
                    >
                      <Rewind10 className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Rewind 10s</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={previousVideo}
                    >
                      <PointerLeft className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Video</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={nextVideo}
                    >
                      <PointerRight className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Next Video</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="-ml-[6px] flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={() => seekTime(isPlayingVideoRef, PlaylistPlayerRef, 10)}
                    >
                      <Skip10 className="h-full w-full" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Skip 10s</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`https://www.youtube.com/watch?v=${currentVideoId.current}&list=${playlistId}&t=${Math.floor(currentTime)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-[3px] mt-[1px] flex size-[30px] cursor-pointer items-center justify-center"
                    >
                      <Youtube className="h-full w-full text-neutral-600 transition duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Open on Youtube</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <ModalDelete
                        icon={<RemoveVideo className="mx-[2px] mb-[3px] size-[30px]" />}
                        deleteText="Remove"
                        type="Video"
                        extraText="From Playlist"
                        title={currentVideoTitle}
                        onDelete={removeVideo}
                        handleVideoPlayback={handleVideoPlayback}
                        isVideoPaused={isVideoPaused}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Remove Video from Playlist</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="flex h-8 w-8 cursor-pointer items-center justify-center text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={isShuffled ? unShuffle : onShuffle}
                    >
                      <Shuffle className={`mt-[1px] h-[30px] w-[30px] ${isShuffled && "text-indigo-500"}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{isShuffled ? "Unshuffle" : "Shuffle"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <ModalDelete
                        icon={<Close className="h-9 w-9" />}
                        deleteText="Remove"
                        type="Playlist"
                        title={currentVideoTitle}
                        onDelete={onDelete}
                        handleVideoPlayback={handleVideoPlayback}
                        isVideoPaused={isVideoPaused}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Delete Playlist</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="min-w-[64px] px-1 pt-[1px] text-[1.35rem] whitespace-nowrap text-neutral-600 dark:text-[#818386]">
                {currentVideoIndex && plLengthRef.current && !isNaN(plLengthRef.current) ? (
                  <span>
                    {currentVideoIndex} / {plLengthRef.current}
                  </span>
                ) : null}
              </p>
            </div>

            <div className="pb-5 max-2xl:-mt-1 2xl:pb-1">
              {currentVideoTitle && (
                <span className="flex justify-center text-center tracking-wide break-words text-neutral-800 dark:text-neutral-200">
                  {currentVideoTitle} - {playlistTitle}
                </span>
              )}
            </div>

            {publishedAt && <VideoDate publishedAt={publishedAt} />}

            {description && <Description description={description} className="pt-5 pb-2 2xl:pt-4" />}

            <div>{isSmaller && <VideosListSidebar videosList={videosList} playVideoAt={playVideoAt} currentVideoIndex={currentVideoIndex} />}</div>
          </div>
        )}
      </div>
    </>
  );
}
