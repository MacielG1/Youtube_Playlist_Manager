"use client";
import { useQuery } from "@tanstack/react-query";
import getPlaylistsData from "@/utils/getPlaylistsData";
import getVideosData from "@/utils/getVideosData";
import { useEffect, useState } from "react";
import spin from "@/assets/spinIcon.svg";
import emptyBox from "@/assets/emptyBox.svg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ItemsList from "./ItemsList";

export default function AllPlaylists() {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [videoItems, setVideoItems] = useState([]);

  const router = useRouter();

  const {
    dataUpdatedAt: plDataUpdatedAt,
    isPlError,
    isFetching: isPlFetching,
    data: plData,
    isFetched: isPlFetched,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: getPlaylistsData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const {
    dataUpdatedAt: vidDataUpdatedAt,
    isVidLoading,
    data: vidData,
    isFetching: isVidFetching,
    isFetched: isVidFetched,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: getVideosData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // useEffect related to the react-query data
  useEffect(() => {
    setPlaylistItems(plData?.items || []);
    if (plData?.items?.length) {
      for (let i of plData?.items) {
        router.prefetch(`/playlist/pl?list=${i.id}`);
      }
    }
  }, [plData, plDataUpdatedAt]);

  useEffect(() => {
    setVideoItems(vidData?.items || []);
    if (vidData?.items?.length) {
      for (let i of vidData?.items) {
        router.prefetch(`/video/v?v=${i.id}`);
      }
    }
  }, [vidData, vidDataUpdatedAt]);

  // useEffect related to the Drag and Drop functionality
  useEffect(() => {
    if (playlistItems.length > 0) {
      localStorage.setItem("playlists", JSON.stringify(playlistItems.map((item) => item.id)));
    }
  }, [playlistItems]);

  useEffect(() => {
    if (videoItems.length > 0) {
      localStorage.setItem("videos", JSON.stringify(videoItems.map((item) => item.id)));
    }
  }, [videoItems]);

  if ((isPlFetching || isVidFetching) && !isPlFetched) {
    return (
      <div className="mx-auto flex justify-center pt-2">
        <Image src={spin} alt="skip 10 seconds" unoptimized width={24} height={24} className="animate-spin" />
      </div>
    );
  }
  if (isPlError) return <div>Error</div>;

  return (
    <>
      {!vidData?.items?.length && !plData?.items?.length && isPlFetched && isVidFetched && (
        <div className="flex items-center flex-col gap-3 pt-10">
          <h3 className=" text-neutral-500 dark:text-neutral-400 text-lg font-semibold tracking-wide">No Items Added</h3>
          <Image src={emptyBox} alt="skip 10 seconds" unoptimized width={52} height={52} />
          <Link
            href="/about"
            className="bg-neutral-200 hover:bg-neutral-300  text-neutral-900 border border-neutral-800 hover:border-neutral-700
            dark:bg-neutral-800 dark:hover:bg-neutral-700  dark:text-neutral-300 dark:hover:text-neutral-300/80 
            py-2 px-4 my-5  inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Learn how it works
          </Link>
        </div>
      )}

      <>
        <ItemsList title="Playlist" setItems={setPlaylistItems} items={playlistItems} otherTypeVideos={videoItems} />
        <ItemsList title="Video" setItems={setVideoItems} items={videoItems} otherTypeVideos={playlistItems} />
      </>
    </>
  );
}
