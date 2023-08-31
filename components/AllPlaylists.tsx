"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Playlist } from "@/types";
import { Icons } from "@/assets/Icons";

import getPlaylistsData from "@/utils/getPlaylistsData";
import getVideosData from "@/utils/getVideosData";
import Link from "next/link";
import ItemsList from "./ItemsList";

export default function AllPlaylists() {
  const [playlistItems, setPlaylistItems] = useState<Playlist[]>([]);
  const [videoItems, setVideoItems] = useState<Playlist[]>([]);

  const {
    dataUpdatedAt: plDataUpdatedAt,
    isError: isPlError,
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
    data: vidData,
    isFetching: isVidFetching,
    isFetched: isVidFetched,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: getVideosData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    setPlaylistItems(plData?.items || []);
  }, [plData, plDataUpdatedAt]);

  useEffect(() => {
    setVideoItems(vidData?.items || []);
  }, [vidData, vidDataUpdatedAt]);

  if ((isPlFetching || isVidFetching) && !isPlFetched) {
    return (
      <div className="mx-auto flex justify-center pt-2">
        <Icons.spinIcon className="h-7 w-7 mt-5 text-blue-500 animate-spin" />
      </div>
    );
  }
  if (isPlError) return <div>Error</div>;

  return (
    <>
      {!vidData?.items?.length && !plData?.items?.length && isPlFetched && isVidFetched && (
        <div className="flex items-center flex-col gap-3 pt-10">
          <h3 className=" text-neutral-500 dark:text-neutral-400 text-lg font-semibold tracking-wide">No Items Added</h3>
          <Icons.emptyBox className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
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
