"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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

  const videoPlayerRef = useRef<YouTube | null>(null);
  const isPlayingVideoRef = useRef<boolean | null>(false);

  const videoId = params.v;
  const item = `v=${videoId}`;

  useEffect(() => {
    const player = videoPlayerRef.current?.getInternalPlayer(); // returns the iframe video  player

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
    videoPlayerRef.current?.internalPlayer.setPlaybackRate(plRate);

    const intervalId = setInterval(() => {
      if (isPlayingVideoRef.current) {
        saveVideoProgress(e.target, videoId);
      }
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }

  function onPlay(e: YouTubeEvent) {
    console.log(e);
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

  // function onStateChange(e: YouTubeEvent) {}

  // function onEnd(e: YouTubeEvent) {}

  function onDelete() {
    localStorage.removeItem(`v=${videoId}`);

    // remove playlist from playlists array
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
    initialTime = JSON.parse(localStorage.getItem(item) || "[]")?.initialTime || 0;
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

  function openModal() {
    videoPlayerRef?.current?.internalPlayer.pauseVideo();
    setIsModalOpen(!isModalOpen);
  }

  // called when cancel or backdrop is clicked
  function onCancel() {
    videoPlayerRef.current?.internalPlayer.playVideo();
    setIsModalOpen(false);
  }

  return (
    <>
      <BackButton />
      <div className="flex flex-col justify-center h-screen items-center  ">
        <div className="w-full min-w-[400px] 2xl:max-w-[75vw] -mt-20 sm:mt-0 pt-2 xl:pt-0 p-[0.15rem] flex justify-center items-center videoPlayer">
          {!isLoaded && (
            <div role="status" className="flex justify-center items-center -mt-20">
              <Icons.spinIcon className="h-7 w-7 mt-5 text-blue-500 animate-spin " />
              <span className="sr-only">Loading...</span>
            </div>
          )}
          <div className={`${isLoaded ? "visible" : "hidden"} relative w-full overflow-hidden pb-[56.25%] `}>
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
              className="absolute top-0 left-0 right-0 w-full h-full border-none"
            />
          </div>
        </div>

        {isLoaded && (
          <div className="flex xs:gap-3 justify-center items-center my-2">
            <button
              className=" cursor-pointer  text-neutral-600 dark:text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-200 transition duration-300 outline-none focus:text-neutral-500"
              onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, -10)}
            >
              <Icons.rewind10 className="h-8 w-8" />
            </button>
            <button
              className=" cursor-pointer  text-neutral-600 dark:text-neutral-400   hover:text-neutral-500 dark:hover:text-neutral-200 transition duration-300 outline-none focus:text-neutral-500"
              onClick={() => seekTime(isPlayingVideoRef, videoPlayerRef, 10)}
            >
              <Icons.skip10 className="h-8 w-8" />
            </button>
            <button
              className="cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-500 transition duration-300 outline-none focus:text-neutral-500"
              onClick={openModal}
            >
              <Icons.closeIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        {isModalOpen && (
          <ModalDelete onClose={onCancel} content={<DeleteModalContent type="Video" id={videoId} title={params.title} openModal={onCancel} onDelete={onDelete} />} />
        )}
      </div>
    </>
  );
}
