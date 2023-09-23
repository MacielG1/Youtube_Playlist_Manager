"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Playlist } from "@/types";
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
    queryFn: async () => {
      return await getPlaylistsData();
    },
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
    queryFn: async () => {
      return await getVideosData();
    },
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
        <Icons.spinIcon className="mt-5 h-7 w-7 animate-spin text-blue-500" />
      </div>
    );
  }
  if (isPlError) return <div className="text-center text-neutral-800 dark:text-neutral-300">Error Fetching the Data</div>;

  return (
    <>
      {!vidData?.items?.length && !plData?.items?.length && isPlFetched && isVidFetched && (
        <div className="flex flex-col items-center gap-3 pt-10">
          <h3 className=" text-lg font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">No Items Added</h3>
          <Icons.emptyBox className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
          <Link
            href="/about"
            className="focus-visible:ring-ring my-5 inline-flex items-center justify-center rounded-md
            border border-neutral-800 bg-neutral-200 px-4 
            py-2 text-sm font-semibold text-neutral-900 ring-offset-background transition-colors hover:border-neutral-700 hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-300/80"
          >
            Learn how it works
          </Link>
        </div>
      )}

      <section className="pb-6 md:pb-0">
        <ItemsList title="Playlist" setItems={setPlaylistItems} items={playlistItems} otherTypeVideos={videoItems} />
        <ItemsList title="Video" setItems={setVideoItems} items={videoItems} otherTypeVideos={playlistItems} />
      </section>
    </>
  );
}
