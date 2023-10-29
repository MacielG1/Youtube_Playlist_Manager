"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { Items } from "@/types";
import { Icons } from "@/assets/Icons";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import seekTime from "@/utils/seekTime";
import LogoButton from "./LogoButton";
import saveVideoProgress from "@/utils/saveVideoProgress";
import DeleteModalContent from "./modals/DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";
import onDeleteItems from "@/utils/onDeleteItem";
import reduceStringSize from "@/utils/reduceStringLength";
import Description from "./Description";
import Tooltip from "./ToolTip";
import { get } from "idb-keyval";
import Link from "next/link";

type Params = {
  v: string;
  title: string;
};

export default function YTVideoPlayer({ params }: { params: Params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  const isPaused = useRef(false); // used to resume video if it was playing when delete modal was opened

  const videoPlayerRef = useRef<YouTube | null>(null);
  const isPlayingVideoRef = useRef<boolean | null>(false);

  const videoId = params.v;
  const item = `v=${videoId}`;
  const [currentTime, setCurrentTime] = useState(0);

  let isBrowser = typeof window !== "undefined";
  useEffect(() => {
    const player = videoPlayerRef?.current?.getInternalPlayer(); // returns the iframe video  player

    const timer = setInterval(() => {
      if (isPlayingVideoRef.current) {
        saveVideoProgress(player, videoId);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  async function onReady(e: YouTubeEvent) {
    setIsLoaded(true);

    const plRate = JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
    videoPlayerRef?.current?.internalPlayer.setPlaybackRate(plRate);

    let data = await get(`v=${videoId}`);
    setDescription(data?.description);

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

  function onDelete() {
    isPlayingVideoRef.current = null;
    router.replace("/");

    onDeleteItems(videoId, "videos");

    queryClient.setQueryData<Items>(["videos"], (oldData) => {
      if (oldData) {
        return {
          ...oldData,
          items: oldData?.items.filter((v) => v.id !== videoId),
        };
      }
    });
  }

  async function openModal() {
    videoPlayerRef?.current?.internalPlayer.pauseVideo();
    isPaused.current = (await videoPlayerRef?.current?.internalPlayer.getPlayerState()) === 2;
    setIsModalOpen(!isModalOpen);
  }

  // called when cancel or backdrop is clicked
  function onCancel() {
    if (!isPaused.current) {
      videoPlayerRef?.current?.internalPlayer.playVideo();
      isPaused.current = false;
    }
    setIsModalOpen(false);
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
      },
    };
  }, []);

  let videoTitle = reduceStringSize(params.title, 100);

  return (
    <>
      <LogoButton />
      <div className="flex min-h-screen flex-col items-center justify-center pt-12  ">
        <div className="videoPlayer flex w-full min-w-[400px] items-center justify-center pt-2 max-xl:p-[0.15rem] 2xl:max-w-[71vw]">
          <div className="relative w-full overflow-auto pb-[56.25%]">
            {!isLoaded && (
              <div className="fixed inset-0 -mt-16 flex items-center justify-center md:-mt-10">
                <Icons.spinIcon className="h-7 w-7 animate-spin text-indigo-500" />
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
            <div className="flex justify-center gap-1 pt-1 xs:gap-3 ">
              <Tooltip text="Rewind 10s">
                <span
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                  onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, -10)}
                >
                  <Icons.rewind10 className="h-8 w-8" />
                </span>
              </Tooltip>
              <Tooltip text="Skip 10s">
                <span
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                  onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, 10)}
                >
                  <Icons.skip10 className="h-8 w-8" />
                </span>
              </Tooltip>
              <Tooltip text="Open on Youtube">
                <Link href={`https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(currentTime)}`} target="_blank" rel="noopener noreferrer">
                  <Icons.youtubeOpen className="ml-[0.15rem] h-8 w-8 fill-neutral-200 px-[0.075rem] text-neutral-600 transition duration-300  hover:text-neutral-950 dark:fill-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200" />
                </Link>
              </Tooltip>
              <Tooltip text="Delete Video">
                <span
                  className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-red-500 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-red-500"
                  onClick={openModal}
                >
                  <Icons.closeIcon className="h-8 w-8 " />
                </span>
              </Tooltip>
            </div>
            {/* Title */}
            <span className="text-balance break-words text-center tracking-wide text-neutral-800 dark:text-neutral-200 ">{videoTitle}</span>

            {description && <Description description={description} className="pb-2 pt-5 2xl:pt-3" />}
          </div>
        )}
        {isModalOpen && (
          <ModalDelete onClose={onCancel} content={<DeleteModalContent type="Video" id={videoId} title={params.title} openModal={onCancel} onDelete={onDelete} />} />
        )}
      </div>
    </>
  );
}
