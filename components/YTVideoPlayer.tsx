"use client";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Items } from "@/types";
import { Icons } from "@/assets/Icons";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";

import seekTime from "@/utils/seekTime";
import BackButton from "./BackButton";
import saveVideoProgress from "@/utils/saveVideoProgress";
import DeleteModalContent from "./DeleteModalContent";
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
  const playingVideoRef = useRef<boolean | null>(false);

  const videoId = params.v;
  const item = `v=${videoId}`;

  useEffect(() => {
    const player = videoPlayerRef.current?.getInternalPlayer(); // returns the iframe video  player

    const timer = setInterval(() => {
      if (playingVideoRef.current) {
        saveVideoProgress(player, videoId);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  function onReady(e: YouTubeEvent) {
    setIsLoaded(true);

    const intervalId = setInterval(() => {
      if (playingVideoRef.current) {
        saveVideoProgress(e.target, videoId);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }

  function onPlay(e: YouTubeEvent) {
    playingVideoRef.current = true;
    saveVideoProgress(e.target, videoId);
  }

  function onPause(e: YouTubeEvent) {
    playingVideoRef.current = false;
    saveVideoProgress(e.target, videoId);
  }
  function onError(e: YouTubeEvent) {
    console.log(e);
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

    playingVideoRef.current = null;
    router.replace("/");
  }

  let initialTime;

  if (typeof window !== "undefined") {
    initialTime = JSON.parse(localStorage.getItem(item) || "[]")?.initialTime || 0;
  } else {
    initialTime = 0;
  }

  const vidOptions: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      start: Math.floor(initialTime),
      origin: window.location.origin,
    },
  };

  function openModal() {
    setIsModalOpen(!isModalOpen);
  }

  return (
    <div className="flex flex-col justify-center items-center pt-8 xl:pt-10 2xl-pt-12 ">
      <BackButton />

      {!isLoaded && (
        <div role="status" className="flex justify-center items-center h-[25vh] md:h-[70vh]">
          <Icons.spinIcon className="h-7 w-7 mt-5 text-blue-500 animate-spin " />
          <span className="sr-only">Loading...</span>
        </div>
      )}

      <div className="w-full min-w-[400px] max-w-[95vw] md:max-w-[880px]  2xl:max-w-[1300px]   mt-4 2xl:mt-5  ">
        <div className={`${isLoaded ? "visible" : "hidden"} flex justify-center items center relative w-full overflow-hidden pb-[56.25%] `}>
          <YouTube
            videoId={videoId}
            ref={videoPlayerRef}
            opts={vidOptions}
            onReady={onReady}
            onPlay={onPlay}
            onPause={onPause}
            // onEnd={onEnd}
            onError={onError}
            // onStateChange={onStateChange}
            className="absolute top-0 left-0 right-0 w-full h-full border-none"
          />
        </div>
      </div>
      {isLoaded && (
        <div className="flex gap-3 justify-center items-center my-2">
          <button
            className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500"
            onClick={() => seekTime(playingVideoRef, videoPlayerRef, -10)}
          >
            <Icons.rewind10 className="h-8 w-8" />
          </button>
          <button
            className=" cursor-pointer  text-neutral-400 transition  hover:text-neutral-500 duration-300 outline-none focus:text-neutral-500"
            onClick={() => seekTime(playingVideoRef, videoPlayerRef, 10)}
          >
            <Icons.skip10 className="h-8 w-8" />
          </button>
          <button className="cursor-pointer text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500" onClick={openModal}>
            <Icons.closeIcon className="w-6 h-6" />
          </button>
        </div>
      )}
      {isModalOpen && (
        <ModalDelete onClose={openModal} content={<DeleteModalContent type="Video" id={videoId} title={params.title} openModal={openModal} onDelete={onDelete} />} />
      )}
    </div>
  );
}
