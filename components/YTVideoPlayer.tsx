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

  function onReady(e: YouTubeEvent) {
    setIsLoaded(true);

    const plRate = JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
    videoPlayerRef?.current?.internalPlayer.setPlaybackRate(plRate);

    setDescription(queryClient.getQueryData<Items>(["videos"])?.items.find((v) => v.id === videoId)?.description || null);

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

  // function onStateChange(e: YouTubeEvent) {
  // }

  // function onEnd(e: YouTubeEvent) {}

  function onDelete() {
    onDeleteItems(videoId, "videos");

    queryClient.setQueryData<Items>(["videos"], (oldData) => {
      if (oldData) {
        return {
          ...oldData,
          items: oldData?.items.filter((v) => v.id !== videoId),
        };
      }
    });

    isPlayingVideoRef.current = null;
    router.replace("/");
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
        origin: window.location.origin || "http://localhost:3000",
      },
    };
  }, []);

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

  let videoTitle = reduceStringSize(params.title, 100);

  return (
    <>
      <LogoButton />
      <div className="flex flex-col items-center justify-center pt-10 ">
        <div className="videoPlayer flex w-full min-w-[400px] items-center justify-center p-[0.15rem] pt-2 xl:pt-0 2xl:max-w-[73vw]">
          <div className={` relative w-full overflow-hidden pb-[56.25%] `}>
            {!isLoaded && (
              <div className="absolute inset-0 -ml-4 -mt-1 flex flex-col items-center justify-center">
                <Icons.spinIcon className="h-7 w-7 animate-spin text-blue-500" />
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
              // onStateChange={onStateChange}
              className={`${isLoaded ? "visible" : "hidden"} absolute left-0 right-0 top-0 h-full w-full border-none`}
            />
          </div>
        </div>
        {isLoaded && (
          <div className=" flex max-w-[80vw] flex-col">
            <div className="flex items-center justify-center gap-1 py-2 xs:gap-3 sm:py-1">
              <button
                className=" cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, -10)}
              >
                <Icons.rewind10 className="h-8 w-8" />
              </button>
              <button
                className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
                onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, 10)}
              >
                <Icons.skip10 className="h-8 w-8" />
              </button>
              <button
                className="cursor-pointer px-1 text-neutral-600 outline-none transition duration-300 hover:text-red-500 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-red-500"
                onClick={openModal}
              >
                <Icons.closeIcon className="h-6 w-6 " />
              </button>
            </div>
            {/* Title */}
            <span className="text-balance break-words pb-[0.8rem] pt-1 text-center tracking-wide text-neutral-800 dark:text-neutral-200">{videoTitle}</span>
            {/* {description && <Description description={description} />} */}
          </div>
        )}

        {isModalOpen && (
          <ModalDelete onClose={onCancel} content={<DeleteModalContent type="Video" id={videoId} title={params.title} openModal={onCancel} onDelete={onDelete} />} />
        )}
      </div>
    </>
  );
}
