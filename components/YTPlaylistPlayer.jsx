"use client";
import Image from "next/image";
import { useRef, useEffect, useState, useMemo } from "react";
import YouTube from "react-youtube";
import fetchVideosIds from "@/utils/fetchVideosIds";
import getPlaylistSize from "@/utils/getPlaylistSize";
import getVideosSlice from "@/utils/getVideosSlice";
import pointerRight from "@/assets/pointerRight.svg";
import pointerLeft from "@/assets/pointerLeft.svg";
import resetIcon from "@/assets/resetIcon.svg";
import skip10 from "@/assets/skip10.svg";
import prev10 from "@/assets/prev10.svg";
import seekTime from "@/utils/seekTime";
import spinIcon from "@/assets/spinIcon.svg";
import BackButton from "./BackButton";
import savePlaylistsProgress from "@/utils/savePlaylistProgress";
import loadPlaylist from "@/utils/loadPlaylist";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DeleteModalContent from "./DeleteModalContent";
import closeIcon from "@/assets/closeIcon.svg";
import ModalDelete from "./modals/ModalDelete";

export default function YoutubePlayer({ params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(1);

  const router = useRouter();
  const queryClient = useQueryClient();

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
    console.log("plVideos", plVideos);
  } else {
    plVideos = [];
    console.log("plVideos", plVideos);
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
          // if hasOnlyData the playlist was already added to storage but is smaller than 200 videos

          const playlistLength = await getPlaylistSize(playlistId);
          playlistLengthRef.current = playlistLength;

          if (playlistLength > 200) {
            // if it became bigger than 200 videos, fetch the new ids
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
        } else if (!allIds.length) {
          // if the playlist is small take the length from the player
          const pl = await PlaylistPlayerRef.current.internalPlayer.getPlaylist();
          playlistLengthRef.current = pl.length;
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

  async function onPause(e) {
    savePlaylistsProgress(e.target, playlistId, pageRef.current);
  }
  async function onError(e) {
    // pageRef.current = 1;
    let data = {
      playlistId,
      currentItem: 0,
      initialTime: 1,
      currentPage: 1,
    };

    setTimeout(async () => {
      let state = e.target.getPlayerState();
      if (state == -1) {
        localStorage.setItem(`pl=${playlistId}`, JSON.stringify(data));
        await resetPlaylist();
      } else {
        e.target.playVideo();
      }
    }, 1000);
  }

  async function onStateChange(e) {
    const index = (await e.target.getPlaylistIndex()) + 1 + (pageRef.current - 1) * 200;
    setCurrentVideoIndex(index);
  }

  async function onEnd(e) {
    const currentIndex = e.target.getPlaylistIndex();

    if (currentIndex < e.target.getPlaylist().length - 1) {
      // e.target.nextVideo();
      e.target.playVideoAt(index + 1);
      e.target.seekTo(0);
    }
    if ((currentIndex + 1) % 200 === 0 && playlistLengthRef.current > 200) {
      // if the index is 199, 399, 599, etc. and videosIds  has more than 200 , 400, 600, etc. videos
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      await loadPlaylist(e.target, allVideosIdsRef.current, nextPage);
    }
  }
  async function previousVideo() {
    const player = PlaylistPlayerRef.current.getInternalPlayer();
    const index = await player.getPlaylistIndex();

    if (playlistLengthRef.current > 200) {
      if (index === 0 && pageRef.current > 1) {
        pageRef.current -= 1;
        await loadPlaylist(player, allVideosIdsRef.current, pageRef.current, 199);
      } else {
        // player.previousVideo();
        player.playVideoAt(index - 1);
        player.seekTo(0);
      }
    } else {
      // player.previousVideo();
      player.playVideoAt(index - 1);
      player.seekTo(0);
    }
  }
  async function nextVideo() {
    const player = PlaylistPlayerRef.current.getInternalPlayer();
    const index = await player.getPlaylistIndex();

    if (playlistLengthRef.current > 200) {
      if ((index + 1) % 200 === 0) {
        pageRef.current += 1;

        await loadPlaylist(player, allVideosIdsRef.current, pageRef.current);
      } else {
        // player.nextVideo();
        player.playVideoAt(index + 1);
        player.seekTo(0);
      }
    } else {
      // player.nextVideo();
      player.playVideoAt(index + 1);
      player.seekTo(0);
    }
  }

  async function resetPlaylist() {
    pageRef.current = 1;
    await loadPlaylist(PlaylistPlayerRef.current.getInternalPlayer(), allVideosIdsRef.current, pageRef.current, 0);
    setCurrentVideoIndex(1);
  }

  let currentItem, initialTime, currentPage;

  if (typeof window !== "undefined") {
    ({ currentItem, initialTime, currentPage } = JSON.parse(localStorage.getItem(item)) || { currentItem: 0, initialTime: 0, currentPage: 1 });
  } else {
    ({ currentItem: 0, initialTime: 0, currentPage: 0 });
  }

  const plOptions = useMemo(() => {
    pageRef.current = currentPage || 1;
    return {
      height: "100%",
      width: "100%",
      playerVars: {
        autoplay: 1,
        listType: "playlist",
        index: currentItem + 1,
        start: Math.floor(initialTime) || 0 || 1,
        origin: window.location.origin,
      },
    };
  }, []);

  if (pageRef.current > 1) {
    plOptions.playerVars.playlist = getVideosSlice(allIds, pageRef.current).join(",");
  } else {
    plOptions.playerVars.list = playlistId;
  }

  function onDelete() {
    localStorage.removeItem(`pl=${playlistId}`);
    localStorage.removeItem(`plVideos=${playlistId}`);

    // remove playlist from playlists array
    const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
    const newPlaylists = allPlaylists.filter((pl) => pl !== playlistId);

    localStorage.setItem("playlists", JSON.stringify(newPlaylists));

    queryClient.setQueryData(["playlists"], (oldData) => {
      return {
        ...oldData,
        items: oldData.items.filter((pl) => pl.id !== playlistId),
      };
    });

    playingVideoRef.current = null;
    router.replace("/");
  }

  function openModal(e) {
    e.stopPropagation();
    PlaylistPlayerRef.current.internalPlayer.pauseVideo();
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
            priority
            style={{ width: "auto", height: "auto" }}
            className="animate-spin flex justify-center items-center h-[25vh] md:h-[55vh]"
          />
          <span className="sr-only">Loading...</span>
        </div>
      )}
      <div className="w-full min-w-[400px] max-w-[95vw] md:max-w-[880px] 2xl:max-w-[1300px] mt-4 2xl:mt-5">
        <div className={`${isLoaded ? "visible" : "hidden"} flex justify-center items center relative w-full overflow-hidden pb-[56.25%] `}>
          <YouTube
            ref={PlaylistPlayerRef}
            opts={plOptions}
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
        <div className="flex gap-4 justify-center items-center my-2">
          <button className=" cursor-pointer text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none  " onClick={resetPlaylist}>
            <Image src={resetIcon} alt="reset playlist" unoptimized width={28} height={28} className="min-w-[1.5rem]" />
          </button>
          <button
            className=" text-neutral-400  cursor-pointer  duration-300 hover:text-neutral-500 transition  outline-none focus:text-neutral-500"
            onClick={() => seekTime(playingVideoRef, PlaylistPlayerRef, -10)}
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
            onClick={() => seekTime(playingVideoRef, PlaylistPlayerRef, 10)}
          >
            <Image src={skip10} alt="skip 10 seconds" unoptimized width={32} height={32} className="min-w-[1.5rem]" />
          </button>

          <span className="pl-3 min-w-[5rem] text-xl text-[#7b7e83]">
            {currentVideoIndex} / {playlistLengthRef.current}
          </span>
          <button className=" cursor-pointer  text-neutral-400 hover:text-neutral-500 transition duration-300 outline-none focus:text-neutral-500" onClick={openModal}>
            <Image src={closeIcon} alt="skip 10 seconds" unoptimized width={21} height={21} className="min-w-[1.4rem]" />
          </button>
        </div>
      )}
      {isModalOpen && (
        <ModalDelete
          onClose={openModal}
          content={<DeleteModalContent type="Playlist" id={playlistId} title={params.title} openModal={openModal} onDelete={onDelete} />}
        />
      )}
    </div>
  );
}
