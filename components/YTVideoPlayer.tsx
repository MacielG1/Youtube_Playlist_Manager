"use client";
import { useRef, useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Items } from "@/types";
import { Icons } from "@/assets/Icons";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";

import seekTime from "@/utils/seekTime";
import BackButton from "./BackButton";
import saveVideoProgress from "@/utils/saveVideoProgress";
import DeleteModalContent from "./modals/DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";

type Params = {
  v: string;
  title: string;
};

export default function YTVideoPlayer({ params }: { params: Params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  const isPaused = useRef(false); // used to resume video if it was playing when delete modal was opened

  const videoPlayerRef = useRef<YouTube | null>(null);
  const isPlayingVideoRef = useRef<boolean | null>(false);

  const videoId = params.v;
  const item = `v=${videoId}`;

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

    const plRate =
      JSON.parse(localStorage.getItem(item) || "[]")?.playbackSpeed || 1;
    videoPlayerRef?.current?.internalPlayer.setPlaybackRate(plRate);

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
  //   console.log("called");
  //   console.log(e);
  // }

  // function onEnd(e: YouTubeEvent) {}

  function onDelete() {
    localStorage.removeItem(`v=${videoId}`);

    const allPlaylists = JSON.parse(localStorage.getItem("videos") || "[]");
    const newPlaylists = allPlaylists.filter((v: string) => v !== videoId);
    localStorage.setItem("videos", JSON.stringify(newPlaylists));

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

  let initialTime: number;

  if (typeof window !== "undefined") {
    initialTime =
      JSON.parse(localStorage.getItem(item) || "[]")?.initialTime || 0;
  } else {
    initialTime = 0;
  }

  const vidOptions: YouTubeProps["opts"] = useMemo(() => {
    return {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        start: Math.floor(initialTime),
        origin: window.location.origin,
      },
    };
  }, []);

  async function openModal() {
    videoPlayerRef?.current?.internalPlayer.pauseVideo();
    isPaused.current =
      (await videoPlayerRef?.current?.internalPlayer.getPlayerState()) === 2;
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

  return (
    <>
      <BackButton />
      <div className="flex h-screen flex-col items-center justify-center ">
        {isLoaded && (
          <span className="-mt-20 py-2 text-center tracking-wide text-neutral-800 dark:text-neutral-200 sm:mt-0">
            {params.title}
          </span>
        )}
        <div className="-0 videoPlayer flex w-full min-w-[400px] items-center justify-center p-[0.15rem] pt-2 xl:pt-0 2xl:max-w-[75vw]">
          {!isLoaded && (
            <div
              role="status"
              className="-mt-20 flex items-center justify-center"
            >
              <Icons.spinIcon className="mt-5 h-7 w-7 animate-spin text-blue-500 " />
              <span className="sr-only">Loading...</span>
            </div>
          )}
          <div
            className={`${
              isLoaded ? "visible" : "hidden"
            } relative w-full overflow-hidden pb-[56.25%] `}
          >
            <YouTube
              videoId={videoId}
              ref={videoPlayerRef}
              opts={vidOptions}
              onReady={onReady}
              onPlay={onPlay}
              onPause={onPause}
              // onEnd={onEnd}
              onError={onError}
              onPlaybackRateChange={onSpeedChange}
              // onStateChange={onStateChange}
              className="absolute left-0 right-0 top-0 h-full w-full border-none"
            />
          </div>
        </div>

        {isLoaded && (
          <div className="my-2 flex items-center justify-center gap-1 xs:gap-3">
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
              className="cursor-pointer text-neutral-600 outline-none transition duration-300 hover:text-red-500 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-red-500"
              onClick={openModal}
            >
              <Icons.closeIcon className="h-6 w-6" />
            </button>
          </div>
        )}
        {isModalOpen && (
          <ModalDelete
            onClose={onCancel}
            content={
              <DeleteModalContent
                type="Video"
                id={videoId}
                title={params.title}
                openModal={onCancel}
                onDelete={onDelete}
              />
            }
          />
        )}
      </div>
    </>
  );
}
