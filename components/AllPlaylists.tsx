"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Items, Playlist } from "@/types";
import getPlaylistsData from "@/utils/getPlaylistsData";
import getVideosData from "@/utils/getVideosData";
import Link from "next/link";
import ItemsList from "./ItemsList";
import Spin from "@/assets/icons/Spin";
import Empty from "@/assets/icons/Empty";

export default function AllPlaylists() {
  const queryClient = useQueryClient();

  const {
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

  const playlistItems = plData?.items ?? [];
  const videoItems = vidData?.items ?? [];

  // ItemsList reorders via setQueryData itself; this setter keeps the
  // Dispatch<SetStateAction> contract by also writing the resolved array
  // to the query cache so the derived `playlistItems` stays in sync.
  const setPlaylistItems = useCallback(
    (next: Playlist[] | ((prev: Playlist[]) => Playlist[])) => {
      const resolved = typeof next === "function" ? next(playlistItems) : next;
      queryClient.setQueryData<Items>(["playlists"], { items: resolved });
    },
    [playlistItems, queryClient],
  );

  const setVideoItems = useCallback(
    (next: Playlist[] | ((prev: Playlist[]) => Playlist[])) => {
      const resolved = typeof next === "function" ? next(videoItems) : next;
      queryClient.setQueryData<Items>(["videos"], { items: resolved });
    },
    [videoItems, queryClient],
  );

  if ((isPlFetching || isVidFetching) && !isPlFetched) {
    return (
      <div className="mx-auto flex justify-center pt-2">
        <Spin className="mt-5 h-7 w-7 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (isPlError) return <div className="text-center text-neutral-800 dark:text-neutral-300">Error Fetching the Data</div>;

  return (
    <>
      {!vidData?.items?.length && !plData?.items?.length && isPlFetched && isVidFetched && (
        <div className="flex flex-col items-center gap-3 pt-10">
          <h3 className="text-lg font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">No Items Added</h3>
          <Empty className="h-12 w-12 text-neutral-400 dark:text-neutral-500" />
          <Link
            href="/about"
            className="focus-visible:ring-ring my-5 inline-flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 ring-offset-background transition-colors hover:border-neutral-700 hover:bg-neutral-300 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-300/80"
          >
            Learn how it works
          </Link>
        </div>
      )}

      <section className="x-4 pb-2 max-md:pb-6">
        <ItemsList title="Playlist" setItems={setPlaylistItems} items={playlistItems} otherTypeVideos={videoItems} />
        <ItemsList title="Video" setItems={setVideoItems} items={videoItems} otherTypeVideos={playlistItems} />
      </section>
    </>
  );
}
