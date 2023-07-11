"use client";
import Image from "next/image";
import { useRef, useEffect, useState, useMemo } from "react";
import YouTube from "react-youtube";
import fetchVideosIds from "@/utils/fetchVideosIds";
import getPlaylistSize from "@/utils/getPlaylistSize";
import getVideosSlice from "@/utils/getVideosSlice";
import getHeightWidth from "@/utils/getHeightWidth";
import pointerRight from "@/assets/pointerRight.svg";
import pointerLeft from "@/assets/pointerLeft.svg";
import resetIcon from "@/assets/resetIcon.svg";
import skip10 from "@/assets/skip10.svg";
import prev10 from "@/assets/prev10.svg";
import skip10seconds from "@/utils/skip10seconds";
import rewind10seconds from "@/utils/rewind10seconds";
import spinIcon from "@/assets/spinIcon.svg";
import BackButton from "./BackButton";
import savePlaylistsProgress from "@/utils/savePlaylistProgress";
import loadPlaylist from "@/utils/loadPlaylist";

export default function YoutubePlayer({ params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1);

  const pageRef = useRef(1);
  const playlistLengthRef = useRef(0);
  const PlaylistPlayerRef = useRef();
  const playingVideoRef = useRef(false);
  const allVideosIdsRef = useRef([]);

  const playlistId = params.list;
  const item = `pl=${playlistId}`;

  let plVideos;
  if (typeof window !== "undefined") {
    plVideos = JSON.parse(localStorage.getItem(`plVideos=${playlistId}`));
  } else {
    plVideos = [];
  }

  let allIds = plVideos?.videosIds || [];

  useEffect(() => {
    async function run() {
      if (plVideos) {
        // if the playlist is already in local storage
        let hasOnlyDate = plVideos.updatedTime && allIds.length == 0;

        let recentThan1day = Date.now() - plVideos.updatedTime < 24 * 60 * 60 * 1000; // 1 day
        let recentThan3days = Date.now() - plVideos.updatedTime < 3 * 24 * 60 * 60 * 1000; // 3 days
        // let recentThan1MIn = Date.now() - plVideos.updatedTime < 60 * 1000; // 1 min

        if (hasOnlyDate && !recentThan3days) {
          // playlist that are on storage but are smaller than 200 videos

          const playlistLength = await getPlaylistSize(playlistId);
          playlistLengthRef.current = playlistLength;

          if (playlistLength > 200) {
            await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
          } else {
            localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ updatedTime: Date.now() }));
          }
        } else if (allIds.length && !recentThan1day) {
          await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
          playlistLengthRef.current = allVideosIdsRef.current.length;
        } else if (allIds.length && recentThan1day) {
          allVideosIdsRef.current = allIds;
          playlistLengthRef.current = allIds.length;
        }
      } else {
        // if it's a new playlist
        const playlistLength = await getPlaylistSize(playlistId);
        playlistLengthRef.current = playlistLength;

        if (playlistLength > 200) {
          await fetchVideosIds(playlistId, allIds, allVideosIdsRef);
        } else {
          localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ updatedTime: Date.now() }));
        }
      }
    }
    run();
  }, []);

  useEffect(() => {
    const player = PlaylistPlayerRef.current.internalPlayer; // returns the iframe video  player

    const timer = setInterval(() => {
      if (playingVideoRef.current) {
        savePlaylistsProgress(player, playlistId, pageRef.current);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  function onReady(e) {
    setIsLoaded(true);

    const intervalId = setInterval(() => {
      if (playingVideoRef.current) {
        savePlaylistsProgress(e.target, playlistId, pageRef.current);
      }
    }, 15000);

    return () => clearInterval(intervalId);
  }

  function onPlay(e) {
    playingVideoRef.current = true;
    savePlaylistsProgress(e.target, playlistId, pageRef.current);
  }

  function onPause(e) {
    playingVideoRef.current = false;
    savePlaylistsProgress(e.target, playlistId, pageRef.current);
  }
  async function onError() {
    pageRef.current = 1;
    let data = {
      playlistId,
      currentItem: 0,
      initialTime: 1,
      currentPage: 1,
    };

    localStorage.setItem(`pl=${playlistId}`, JSON.stringify(data));
  }
  async function onStateChange(e) {
    console.log(pageRef.current, "pageRef.current");
    const index = (await e.target.getPlaylistIndex()) + 1 + (pageRef.current - 1) * 200;
    setCurrentIndex(index);
  }

  async function onEnd(e) {
    const currentIndex = e.target.getPlaylistIndex();

    if (currentIndex < e.target.getPlaylist().length - 1) {
      e.target.nextVideo();
    }
    if ((currentIndex + 1) % 200 === 0 && playlistLengthRef.current > 200) {
      // if the index is 199, 399, 599, etc. and videosIds  has more than 200 , 400, 600, etc. videos
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      await loadPlaylist(e.target, allVideosIdsRef.current, nextPage);
    }
  }

  let currentItem, initialTime, currentPage;

  if (typeof window !== "undefined") {
    ({ currentItem, initialTime, currentPage } = JSON.parse(localStorage.getItem(item)) || { currentItem: 0, initialTime: 0, currentPage: 1 });
  } else {
    ({ currentItem, initialTime, currentPage } = { currentItem: 0, initialTime: 0, currentPage: 1 });
  }

  pageRef.current = currentPage || 1;

  const { height, width } = getHeightWidth();
  const plOptions = useMemo(() => {
    return {
      height: height || 540,
      width: width || 960,
      playerVars: {
        autoplay: 1,
        listType: "playlist",
        index: currentItem + 1,
        start: Math.floor(initialTime) || 0 || 1,
      },
    };
  }, []);

  if (pageRef.current > 1) {
    plOptions.playerVars.playlist = getVideosSlice(allIds, pageRef.current).join(",");
  } else {
    plOptions.playerVars.list = playlistId;
  }

  async function resetPlaylist() {
    pageRef.current = 1;
    await resetPlaylist(PlaylistPlayerRef.current.internalPlayer, playlistId);
    setCurrentIndex(1);
    savePlaylistsProgress(PlaylistPlayerRef.current.internalPlayer, playlistId, pageRef.current);
  }

  async function previousVideo() {
    if (playlistLengthRef.current > 200) {
      const player = PlaylistPlayerRef.current.internalPlayer;
      let currentIndex = await player.getPlaylistIndex();

      if (pageRef.current === 2 && currentIndex === 0) {
        pageRef.current = 1;
        await resetPlaylist(PlaylistPlayerRef.current.internalPlayer, playlistId, 199);
      }

      if (currentIndex === 0 && pageRef.current > 2) {
        pageRef.current -= 1;

        await loadPlaylist(player, allVideosIdsRef.current, pageRef.current, 199);
      } else {
        player.previousVideo();
      }
    } else {
      PlaylistPlayerRef.current.internalPlayer.previousVideo();
    }
  }
  async function nextVideo() {
    if (playlistLengthRef.current > 200) {
      const player = PlaylistPlayerRef.current.internalPlayer;

      if (((await player.getPlaylistIndex()) + 1) % 200 === 0) {
        pageRef.current += 1;
        await loadPlaylist(player, allVideosIdsRef.current, pageRef.current);
      } else {
        player.nextVideo();
      }
    } else {
      PlaylistPlayerRef.current.internalPlayer.nextVideo();
    }
  }

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
          ref={PlaylistPlayerRef}
          opts={plOptions}
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
          <button className=" cursor-pointer text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none  " onClick={resetPlaylist}>
            <Image src={resetIcon} alt="reset playlist" unoptimized width={28} height={28} className="min-w-[1.5rem]" />
          </button>
          <button
            className=" text-neutral-400  cursor-pointer  duration-300 hover:text-neutral-500 transition  outline-none focus:text-neutral-500"
            onClick={() => rewind10seconds(playingVideoRef, PlaylistPlayerRef)}
          >
            <Image src={prev10} alt="rewind 10 seconds" unoptimized width={32} height={32} className="min-w-[1.5rem]" />
          </button>
          <button className=" cursor-pointer text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none " onClick={previousVideo}>
            <Image src={pointerLeft} alt="next video button" unoptimized width={32} height={32} className="min-w-[1.5rem]" />
          </button>
          <button className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500" onClick={nextVideo}>
            <Image src={pointerRight} alt="next video button" unoptimized width={32} height={32} className="min-w-[1.5rem]" />
          </button>
          <button
            className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500"
            onClick={() => skip10seconds(playingVideoRef, PlaylistPlayerRef)}
          >
            <Image src={skip10} alt="skip 10 seconds" unoptimized width={32} height={32} className="min-w-[1.5rem]" />
          </button>
          <span>
            {currentIndex} / {playlistLengthRef.current}
          </span>
        </div>
      )}
    </div>
  );
}
