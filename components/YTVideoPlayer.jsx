"use client";
import { useRef, useEffect, useState } from "react";
import YouTube from "react-youtube";
import skip10 from "@/assets/skip10.svg";
import prev10 from "@/assets/prev10.svg";
import Image from "next/image";
import getHeightWidth from "@/utils/getHeightWidth";
import skip10seconds from "@/utils/skip10seconds";
import rewind10seconds from "@/utils/rewind10seconds";
import spinIcon from "@/assets/spinIcon.svg";
import BackButton from "./BackButton";
import saveVideoProgress from "@/utils/saveVideoProgress";

export default function YTVideoPlayer({ params }) {
  const [isLoaded, setIsLoaded] = useState(false);

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

  let initialTime;

  if (typeof window !== "undefined") {
    initialTime = JSON.parse(localStorage.getItem(item)).initialTime || 0;
    console.log(initialTime);
  } else {
    initialTime = 0;
  }

  const { height, width } = getHeightWidth();

  const vidOptions = {
    height: height || 540,
    width: width || 960,
    playerVars: {
      autoplay: 1,
      start: Math.floor(initialTime),
    },
  };

  return (
    <div className="flex flex-col justify-center items-center p-20 ">
      <BackButton />

      {!isLoaded && (
        <div role="status">
          <Image
            src={spinIcon}
            alt="loading"
            unoptimized
            width={24}
            height={24}
            priority
            className="animate-spin flex justify-center items-center h-[25vh] md:h-[55vh]"
          />
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <div className={`${isLoaded ? "visible" : "hidden"} flex justify-center items center `}>
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
        />
      </div>
      {isLoaded && (
        <div className="flex gap-3 justify-center items-center my-2">
          <button
            className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500"
            onClick={() => rewind10seconds(playingVideoRef, videoPlayerRef)}
          >
            <Image src={prev10} alt="rewind 10 seconds" unoptimized width={32} height={32} />
          </button>
          <button
            className=" cursor-pointer  text-neutral-400 transition  hover:text-neutral-500 duration-300 outline-none focus:text-neutral-500"
            onClick={() => skip10seconds(playingVideoRef, videoPlayerRef)}
          >
            <Image src={skip10} alt="skip 10 seconds" unoptimized width={32} height={32} />
          </button>
        </div>
      )}
    </div>
  );
}
