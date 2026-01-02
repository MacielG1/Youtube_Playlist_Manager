"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Items } from "@/types";
import { toastError } from "@/utils/toastStyles";
import { set } from "idb-keyval";
import getChannelId from "@/utils/createChannelPlaylist";
import toast from "react-hot-toast";
import getVideosData from "@/utils/getVideosData";
import getPlaylistsData from "@/utils/getPlaylistsData";
import fetchVideosIds from "@/utils/fetchVideosIds";
import Search from "@/assets/icons/Search";
import Spin from "@/assets/icons/Spin";

export default function Input() {
  const [addedURL, setAddedURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddedURL(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!addedURL) {
        toast.error("Please Enter a URL!", toastError);
        return;
      }
      let isChannelName = false;
      let playlistID, videoId, isChannelUrl, isChannelNameUrl, url;

      try {
        url = new URL(addedURL);
      } catch (error) {
        isChannelName = true; // if not url is a entered name
      }

      if (url) {
        playlistID = url.searchParams.get("list");
        videoId = url.searchParams.get("v");
        isChannelUrl = url.pathname.includes("channel");
        isChannelNameUrl = url.pathname.startsWith("/@");

        if (url.hostname === "youtu.be") {
          videoId = url.pathname.split("/").pop();
        }
      }

      // Video
      if (videoId && !playlistID) {
        let videoKey = "v=" + videoId;
        if (localStorage.getItem(videoKey)) {
          toast.error("Video Already Added!", toastError);
          return setAddedURL("");
        }

        const data = await getVideosData(videoId);

        // Updating the query data with the new playlist
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
          localStorage.setItem("videos", JSON.stringify([...allVideos, videoId]));
        } else {
          toast.error("Video is Invalid or Private!", toastError);
          localStorage.removeItem(videoKey);
        }
        return setAddedURL("");
      }
      // Playlist or Channel Url
      if (playlistID || isChannelUrl) {
        let id = playlistID || "";
        if (isChannelUrl) {
          id = url!.pathname.split("/")[2].replace("UC", "UU");
        }
        let playlistKey = "pl=" + id;

        if (localStorage.getItem(playlistKey)) {
          toast.error("Playlist Already Added!", toastError);
          setAddedURL("");
          return;
        }
        const [playlistData, videosData] = await Promise.all([getPlaylistsData(id), fetchVideosIds(id)]);

        await set(playlistKey, videosData);

        // Updating the query data with the new playlist
        if (playlistData?.items?.length) {
          queryClient.setQueryData<Items>(["playlists"], (prev) => {
            // if no playlists saved, return the new one
            if (!prev || !prev?.items?.length) return playlistData;

            return {
              ...playlistData,
              items: [...prev.items, ...playlistData.items],
            };
          });

          localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));
          const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
          localStorage.setItem("playlists", JSON.stringify([...allPlaylists, playlistID]));
        } else {
          toast.error("Playlist is Invalid or Private!", toastError);
          localStorage.removeItem(playlistKey);
        }
        return setAddedURL("");
      }

      // Channel Name or URL with Channel Name
      if (isChannelName || isChannelNameUrl) {
        const name = isChannelNameUrl ? url!.pathname.split("/")[1] : addedURL;

        const channelId = await getChannelId(name);
        setAddedURL("");

        if (!channelId) {
          toast.error("Invalid Channel!", toastError);
          return null;
        }
        const playlistKey = "pl=" + channelId;
        if (localStorage.getItem(playlistKey)) {
          toast.error("Channel Already Added!", toastError);
          return null;
        }

        const [playlistData, videosData] = await Promise.all([getPlaylistsData(channelId), fetchVideosIds(channelId, undefined, true)]);

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
        } else {
          toast.error("Playlist is Invalid or Private!", toastError);
          localStorage.removeItem(playlistKey);
        }
        return setAddedURL("");
      }

      try {
        let params = new URL(addedURL).searchParams;
        playlistID = params.get("list");
        videoId = params.get("v");
      } catch (error) {
        return console.log(error);
      }

      setAddedURL("");
      if (!isChannelName && !videoId && !playlistID && !isChannelUrl && !isChannelNameUrl) {
        setAddedURL("");
        toast.error("Please Enter a Valid URL or a Channel Name!", toastError);
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, toastError);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <header className="sticky max-sm:pt-12">
      <nav className="xs:pt-3 relative top-0 z-20 w-full bg-inherit px-2 pb-5 sm:pt-4">
        <form className="flex max-h-12 justify-center gap-3" onSubmit={handleSubmit}>
          <div className="group relative w-[65vw] min-w-[16px] md:w-[480px]">
            <input
              type="text"
              value={addedURL}
              id="input"
              onChange={handleInputChange}
              placeholder="Enter a Video or Playlist URL or Channel Name"
              className="xs:placeholder:text-base peer h-11 w-full rounded-xl border border-neutral-300 bg-white/80 px-4 pr-3 text-neutral-900 shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-sm placeholder:text-neutral-400 hover:border-neutral-400 hover:bg-white focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none sm:text-base dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:focus:border-blue-500 dark:focus:bg-neutral-900 dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
            />
            {isLoading && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                <Spin className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-linear-to-b from-blue-500 to-blue-600 text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-500 disabled:shadow-none dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 dark:focus:ring-offset-neutral-900 dark:disabled:from-neutral-700 dark:disabled:to-neutral-800"
          >
            <Search className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
          </button>
        </form>
      </nav>
    </header>
  );
}
