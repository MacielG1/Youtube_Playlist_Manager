"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { Items, Video } from "@/types";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import seekTime from "@/utils/seekTime";
import LogoButton from "./LogoButton";
import saveVideoProgress from "@/utils/saveVideoProgress";
import ModalDelete from "./modals/ModalDelete";
import onDeleteItems from "@/utils/onDeleteItem";
import reduceStringSize from "@/utils/reduceStringLength";
import Description from "./Description";
import { del, get } from "idb-keyval";
import Link from "next/link";
import Spin from "@/assets/icons/Spin";
import Rewind10 from "@/assets/icons/Rewind10";
import Skip10 from "@/assets/icons/Skip10";
import Youtube from "@/assets/icons/Youtube";
import Channel from "@/assets/icons/Channel";
import Close from "@/assets/icons/Close";
import { useAudioToggle } from "@/providers/SettingsProvider";
import SkipBack from "@/assets/icons/skipBack";
import VideoDate from "./VideoDate";
import Reset from "@/assets/icons/Reset";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ToolTip";

type Params = {
  v: string;
  title: string;
};

export default function YTVideoPlayer({ params }: { params: Params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { isAudioMuted } = useAudioToggle();

  const queryClient = useQueryClient();
  const router = useRouter();

  const isPaused = useRef(false);
  const videoPlayerRef = useRef<YouTube | null>(null);
  const isPlayingVideoRef = useRef<boolean | null>(false);

  const videoId = params.v;
  const item = `v=${videoId}`;
  const [currentTime, setCurrentTime] = useState(0);

  let isBrowser = typeof window !== "undefined";

  useEffect(() => {
    const player = videoPlayerRef?.current?.getInternalPlayer();

    if (!player) return;

    const timer = setInterval(() => {
      if (isPlayingVideoRef.current && player) {
        saveVideoProgress(player, videoId);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const player = videoPlayerRef?.current?.internalPlayer;
    if (!player) return;

    try {
      isAudioMuted ? player.mute() : player.unMute();
    } catch (error) {
      console.error("Error setting mute state:", error);
    }
  }, [isAudioMuted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function onReady(e: YouTubeEvent) {
    try {
      if (!e.target) return;
      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const player = videoPlayerRef?.current?.internalPlayer;
        if (!player) {
          console.warn("Player not initialized in onReady");
          return;
        }

        setIsLoaded(true);

        try {
          const plRate = JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
          await player.setPlaybackRate(plRate);
        } catch (err) {
          console.warn("Could not set playback rate:", err);
        }

        let data = await get(`v=${videoId}`);
        setVideoData(data);
      } catch (err) {
        console.warn("Error initializing player:", err);
      }
    } catch (error) {
      console.error("Error in onReady:", error);
    }
  }

  function onPlay(e: YouTubeEvent) {
    if (!e.target) return;
    isPlayingVideoRef.current = true;
    saveVideoProgress(e.target, videoId);
  }

  function onPause(e: YouTubeEvent) {
    if (!e.target) return;
    isPlayingVideoRef.current = false;
    saveVideoProgress(e.target, videoId);
  }
  function onError(e: YouTubeEvent) {
    console.log("Video error:", e);

    if (e.data === 101 || e.data === 150) {
      setEmbedError(true);
      console.log("Video unavailable - showing error modal");
    }
  }
  function onSpeedChange(e: YouTubeEvent) {
    let currentData = JSON.parse(localStorage.getItem(item) || "[]");
    currentData.playbackSpeed = e.data;

    localStorage.setItem(item, JSON.stringify(currentData));
  }

  function onStateChange(e: YouTubeEvent) {
    if (e.target) {
      setCurrentTime(e.target.getCurrentTime());
    }
  }

  // function onEnd(e: YouTubeEvent) {}

  async function onDelete() {
    isPlayingVideoRef.current = null;

    router.replace("/");

    onDeleteItems(videoId, "videos");

    await del(`v=${videoId}`);

    queryClient.setQueryData<Items>(["videos"], (oldData) => {
      if (oldData) {
        return {
          ...oldData,
          items: oldData?.items.filter((v) => v.id !== videoId),
        };
      }
    });
  }

  async function isVideoPaused() {
    try {
      const player = videoPlayerRef.current?.internalPlayer;
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
      const player = videoPlayerRef.current?.internalPlayer;
      if (!player) return;

      const playerState = await player.getPlayerState();

      if (mode === "play" && playerState === 2) {
        player.playVideo();
        isPaused.current = false;
      } else if (mode === "pause" && playerState === 1) {
        player.pauseVideo();
        isPaused.current = true;
      }
    } catch (error) {
      console.error("Error handling video playback:", error);
    }
  }

  let initialTime = 0;

  if (isBrowser) {
    initialTime = JSON.parse(localStorage.getItem(item) || "[]")?.initialTime || 0;
  }

  const vidOptions: YouTubeProps["opts"] = useMemo(() => {
    return {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        start: Math.floor(initialTime),
        origin: isBrowser ? window.location.origin : "http://localhost:3000",
        mute: isAudioMuted || false,
      },
    };
  }, []);

  let videoTitle = reduceStringSize(videoData?.title, 100);

  if (!isMounted) return null;

  return (
    <>
      <LogoButton />

      <div className="flex min-h-screen flex-col items-center justify-center pt-12">
        <div className="videoPlayer flex w-full min-w-[400px] items-center justify-center pt-2 max-xl:p-[2.4px] 2xl:max-w-[71vw]">
          <div className="relative w-full overflow-auto pb-[56.25%]">
            {!isLoaded && (
              <div className="fixed inset-0 -mt-16 flex items-center justify-center md:-mt-10">
                <Spin className="h-7 w-7 animate-spin text-indigo-500" />
                <span className="sr-only">Loading...</span>
              </div>
            )}

            <YouTube
              videoId={videoId}
              ref={videoPlayerRef}
              opts={vidOptions}
              onReady={onReady}
              onPlay={onPlay}
              onPause={onPause}
              onError={onError}
              onPlaybackRateChange={onSpeedChange}
              // onEnd={onEnd}
              onStateChange={onStateChange}
              className="absolute top-0 right-0 left-0 h-full w-full border-none"
            />

            {embedError && (
              <div className="absolute right-0 bottom-0 left-0 z-20 flex flex-col items-center justify-center pb-4">
                <div className="max-w-[95%] rounded-lg border border-neutral-300 bg-neutral-100/95 px-6 py-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900/95">
                  <div className="text-center">
                    <h2 className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">Video Unavailable</h2>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => {
                          setEmbedError(false);
                          window.location.reload();
                        }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                      >
                        <Reset className="size-5" />
                        Refresh
                      </button>
                      <Link
                        href={`https://www.youtube.com/watch?v=${videoId}`}
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
              </div>
            )}
          </div>
        </div>
        {isLoaded && (
          <div className="flex max-w-[80vw] flex-col">
            <div className="xs:gap-3 flex justify-center gap-1 pt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className="cursor-pointer text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={() => videoPlayerRef?.current?.internalPlayer.seekTo(0)}
                    >
                      <SkipBack className="h-8 w-8" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Restart</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className="cursor-pointer text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, -10)}
                    >
                      <Rewind10 className="h-8 w-8" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Rewind 10s</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className="cursor-pointer text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                      onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, 10)}
                    >
                      <Skip10 className="h-8 w-8" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Skip 10s</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <Link href={`https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(currentTime)}`} target="_blank" rel="noopener noreferrer">
                      <Youtube className="mx-[2.4px] h-8 w-8 fill-neutral-200 px-[0.56px] pb-[0.8px] text-neutral-600 transition duration-300 hover:text-neutral-950 dark:fill-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Open on Youtube</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <Link
                      href={
                        videoData?.channelId
                          ? `https://www.youtube.com/channel/${videoData.channelId}`
                          : `https://www.youtube.com/results?search_query=${encodeURIComponent(videoData?.channel || "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-[1px]"
                    >
                      <Channel className="h-8 w-8 text-neutral-600 transition duration-300 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-200" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Open Channel</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <ModalDelete
                      icon={<Close className="h-8 w-8" />}
                      deleteText="Delete"
                      type="Video"
                      id={videoId}
                      title={videoData?.title ?? ""}
                      onDelete={onDelete}
                      handleVideoPlayback={handleVideoPlayback}
                      isVideoPaused={isVideoPaused}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Delete Video</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {/* Title */}
            <span className="mx-auto my-1 text-center tracking-wide break-words text-neutral-800 dark:text-neutral-200">
              {videoTitle} {videoData?.channel && `- ${videoData.channel}`}
            </span>

            {videoData?.publishedAt && <VideoDate publishedAt={videoData.publishedAt} />}

            {videoData?.description && <Description description={videoData?.description} className="pt-5 pb-2 2xl:pt-4" />}
          </div>
        )}
      </div>
    </>
  );
}
