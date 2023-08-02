"use client";
import { useRef, useEffect, useState } from "react";
import YouTube from "react-youtube";
import skip10 from "@/assets/skip10.svg";
import prev10 from "@/assets/prev10.svg";
import Image from "next/image";
import seekTime from "@/utils/seekTime";
import spinIcon from "@/assets/spinIcon.svg";
import BackButton from "./BackButton";
import saveVideoProgress from "@/utils/saveVideoProgress";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import closeIcon from "@/assets/closeIcon.svg";
import DeleteModalContent from "./DeleteModalContent";
import { useQueryClient } from "@tanstack/react-query";

export default function YTVideoPlayer({ params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  const videoPlayerRef = useRef();
  const playingVideoRef = useRef(false);

  const videoId = params.v;
  const item = `v=${videoId}`;

  useEffect(() => {
    const player = videoPlayerRef.current.getInternalPlayer(); // returns the iframe video  player

    const timer = setInterval(() => {
      if (playingVideoRef.current) {
        saveVideoProgress(player, videoId);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  function onReady(e) {
    console.log("READY");
    setIsLoaded(true);

    const intervalId = setInterval(() => {
      if (playingVideoRef.current) {
        saveVideoProgress(e.target, videoId);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }

  function onPlay(e) {
    playingVideoRef.current = true;
    saveVideoProgress(e.target, videoId);
  }

  function onPause(e) {
    playingVideoRef.current = false;
    saveVideoProgress(e.target, videoId);
  }
  function onError(e) {
    console.log(e);
  }

  function onStateChange(e) {}

  function onEnd(e) {}

  function onDelete() {
    localStorage.removeItem(`v=${videoId}`);

    // remove playlist from playlists array
    const allPlaylists = JSON.parse(localStorage.getItem("videos")) || [];
    const newPlaylists = allPlaylists.filter((v) => v !== videoId);
    localStorage.setItem("videos", JSON.stringify(newPlaylists));

    queryClient.setQueryData(["videos"], (oldData) => {
      return {
        ...oldData,
        items: oldData.items.filter((v) => v.id !== videoId),
      };
    });

    playingVideoRef.current = null;

    router.replace("/");
  }

  let initialTime;

  if (typeof window !== "undefined") {
    initialTime = JSON.parse(localStorage.getItem(item))?.initialTime || 0;
    console.log(initialTime);
  } else {
    initialTime = 0;
  }

  const vidOptions = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      start: Math.floor(initialTime),
      origin: window.location.origin,
    },
  };

  function openModal(e) {
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  }

  return (
    <div className="flex flex-col justify-center items-center pt-8 xl:pt-10 2xl-pt-12 ">
      <BackButton />

      {!isLoaded && (
        <div role="status">
          <Image
            src={spinIcon}
            alt="loading"
            unoptimized
            width={24}
            height={24}
            style={{ width: "auto", height: "auto" }}
            priority
            className="animate-spin flex justify-center items-center h-[25vh] md:h-[55vh]"
          />
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
            onEnd={onEnd}
            onError={onError}
            onStateChange={onStateChange}
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
            <Image src={prev10} alt="rewind 10 seconds" unoptimized width={32} height={32} />
          </button>
          <button
            className=" cursor-pointer  text-neutral-400 transition  hover:text-neutral-500 duration-300 outline-none focus:text-neutral-500"
            onClick={() => seekTime(playingVideoRef, videoPlayerRef, 10)}
          >
            <Image src={skip10} alt="skip 10 seconds" unoptimized width={32} height={32} />
          </button>
          <button className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500" onClick={openModal}>
            <Image src={closeIcon} alt="skip 10 seconds" unoptimized width={22} height={22} className="min-w-[1.5rem]" />
          </button>
        </div>
      )}
      {isModalOpen && (
        <Modal
          onClose={openModal}
          content={<DeleteModalContent type="Video" id={videoId} title={params.title} isLoading={isLoaded} openModal={openModal} onDelete={onDelete} />}
        />
      )}
    </div>
  );
}
