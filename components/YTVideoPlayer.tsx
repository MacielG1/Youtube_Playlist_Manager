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
import Close from "@/assets/icons/Close";
import { useAudioToggle } from "@/providers/SettingsProvider";
import SkipBack from "@/assets/icons/skipBack";
import VideoDate from "./VideoDate";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ToolTip";

type Params = {
  v: string;
  title: string;
};

export default function YTVideoPlayer({ params }: { params: Params }) {
  const [isLoaded, setIsLoaded] = useState(false);

  const [videoData, setVideoData] = useState<Video | null>(null);
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

    const timer = setInterval(() => {
      if (isPlayingVideoRef.current) {
        saveVideoProgress(player, videoId);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const player = videoPlayerRef?.current?.internalPlayer;
    if (player) {
      isAudioMuted ? player.mute() : player.unMute();
    }
  }, [isAudioMuted]);

  async function onReady(e: YouTubeEvent) {
    setIsLoaded(true);

    const plRate = JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
    videoPlayerRef?.current?.internalPlayer?.setPlaybackRate(plRate);

    let data = await get(`v=${videoId}`);
    setVideoData(data);

    const intervalId = setInterval(() => {
      if (isPlayingVideoRef.current) {
        saveVideoProgress(e.target, videoId);
      }
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }

  function onPlay(e: YouTubeEvent) {
    isPlayingVideoRef.current = true;
    saveVideoProgress(e.target, videoId);
  }

  function onPause(e: YouTubeEvent) {
    isPlayingVideoRef.current = false;
    saveVideoProgress(e.target, videoId);
  }
  function onError(e: YouTubeEvent) {
    console.log(e);
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
    const playerState = await videoPlayerRef.current?.internalPlayer.getPlayerState();
    return playerState === 2;
  }

  async function handleVideoPlayback(mode: "play" | "pause") {
    const playerState = await videoPlayerRef.current?.internalPlayer.getPlayerState();

    if (mode === "play" && playerState === 2) {
      videoPlayerRef.current?.internalPlayer.playVideo();
      isPaused.current = false;
    } else if (mode === "pause" && playerState === 1) {
      videoPlayerRef.current?.internalPlayer.pauseVideo();
      isPaused.current = true;
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

  return (
    <>
      <LogoButton />
      <div className="flex min-h-screen flex-col items-center justify-center pt-12">
        <div className="videoPlayer flex w-full min-w-[400px] items-center justify-center pt-2 max-xl:p-[0.15rem] 2xl:max-w-[71vw]">
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
              className={`${isLoaded ? "visible" : "hidden"} absolute left-0 right-0 top-0 h-full w-full border-none`}
            />
          </div>
        </div>
        {isLoaded && (
          <div className="flex max-w-[80vw] flex-col">
            <div className="flex justify-center gap-1 pt-1 xs:gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span
                      className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
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
                      className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
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
                      className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
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
                      <Youtube className="mx-[0.15rem] h-8 w-8 fill-neutral-200 px-[0.035rem] pb-[0.05rem] text-neutral-600 transition duration-300 hover:text-neutral-950 dark:fill-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Open on Youtube</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <ModalDelete
                      icon={<Close className="mt-1.5 h-8 w-8" />}
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
            <span className="mx-auto my-1 break-words text-center tracking-wide text-neutral-800 dark:text-neutral-200">
              {videoTitle} {videoData?.channel && `- ${videoData.channel}`}
            </span>

            {videoData?.publishedAt && <VideoDate publishedAt={videoData.publishedAt} />}

            {videoData?.description && <Description description={videoData?.description} className="pb-2 pt-5 2xl:pt-4" />}
          </div>
        )}
      </div>
    </>
  );
}
