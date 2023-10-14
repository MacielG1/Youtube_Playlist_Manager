"use client";
import { toastError, toastSuccess } from "@/utils/toastStyles";
import toast from "react-hot-toast";
import getVideosData from "@/utils/getVideosData";
import getPlaylistsData from "@/utils/getPlaylistsData";
import fetchVideosIds from "@/utils/fetchVideosIds";
import { get, set } from "idb-keyval";
import { Items } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import getChannelId from "@/utils/createChannelPlaylist";
import { Icons } from "@/assets/Icons";

export default function AddExternalItem({ searchParams }: { searchParams: { type: string; id: string } }) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    async function run() {
      if (typeof window === "undefined") return null;

      if (!searchParams.type || !searchParams.id) return null;
      const id = searchParams.id;
      try {
        // VIDEO
        if (searchParams.type === "video") {
          let videoKey = "v=" + id;

          if (localStorage.getItem(videoKey)) {
            toast.error("Video Already Added!", toastError);
            return;
          }

          const data = await getVideosData(id);

          await set(videoKey, { id: id, description: data.items[0].description });

          if (data?.items?.length) {
            queryClient.setQueryData<Items>(["videos"], (prev) => {
              if (!prev || !prev?.items?.length) return data;

              return {
                ...data,
                items: [...prev.items, ...data.items],
              };
            });

            localStorage.setItem(videoKey, JSON.stringify({ initialTime: 0 }));
            const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");
            localStorage.setItem("videos", JSON.stringify([...allVideos, id]));
            return toast.success("Video Added!", toastSuccess);
          } else {
            toast.error("Video is Invalid or Private!", toastError);
            localStorage.removeItem(videoKey);
          }
        }

        // PLAYLIST or CHANNEL ID
        if (searchParams.type === "playlist") {
          let playlistKey = "pl=" + id;

          if (localStorage.getItem(playlistKey)) {
            toast.error("Playlist Already Added!", toastError);
            return null;
          }

          const playlistData = await getPlaylistsData(id);
          const videosData = await fetchVideosIds(id);

          await set(playlistKey, videosData);

          if (playlistData?.items?.length) {
            queryClient.setQueryData<Items>(["playlists"], (prev) => {
              if (!prev || !prev?.items?.length) return playlistData;

              return {
                ...playlistData,
                items: [...prev.items, ...playlistData.items],
              };
            });

            localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));
            const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
            localStorage.setItem("playlists", JSON.stringify([...allPlaylists, id]));
            return toast.success("Playlist Added!", toastSuccess);
          } else {
            toast.error("Playlist is Invalid or Private!", toastError);
            localStorage.removeItem(playlistKey);
          }
        }

        // CHANNEL NAME
        if (searchParams.type === "channel") {
          const channelId = await getChannelId(id);

          if (!channelId) {
            toast.error("Invalid Channel!", toastError);
            return null;
          }
          const playlistKey = "pl=" + channelId;
          if (localStorage.getItem(playlistKey)) {
            toast.error("Channel Already Added!", toastError);
            return null;
          }

          const playlistData = await getPlaylistsData(channelId);
          const videosData = await fetchVideosIds(channelId, undefined, true);

          await set(playlistKey, videosData);

          if (playlistData?.items?.length) {
            queryClient.setQueryData<Items>(["playlists"], (prev) => {
              // if no playlists saved, return the new one
              if (!prev || !prev?.items?.length) return playlistData;

              return {
                ...playlistData,
                items: [...prev.items, playlistData.items[0]],
              };
            });

            localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0, isChannel: true }));
            const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
            localStorage.setItem("playlists", JSON.stringify([...allPlaylists, channelId]));
            return toast.success("Channel Added!", toastSuccess);
          } else {
            toast.error("Playlist is Invalid or Private!", toastError);
            localStorage.removeItem(playlistKey);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        router.push("/");
        setIsLoading(false);
      }
    }
    run();
  }, []);
  return (
    <div className="flex min-h-[10vh] w-full items-center justify-center gap-2">
      <span className="text-base tracking-wide text-indigo-100">Adding Item</span>
      <Icons.loadingIcon className="h-6 w-6 text-indigo-500" />
    </div>
  );
}