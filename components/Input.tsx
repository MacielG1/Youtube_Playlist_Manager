"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icons } from "@/assets/Icons";
import type { Items } from "@/types";
import { toastError } from "@/utils/toastStyles";
import getChannelId from "@/utils/createChannelPlaylist";
import toast from "react-hot-toast";
import getVideosData from "@/utils/getVideosData";
import getPlaylistsData from "@/utils/getPlaylistsData";
import fetchVideosIds from "@/utils/fetchVideosIds";
import { set } from "idb-keyval";

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

      const isChannel = !/(list=|v=)/.test(addedURL);

      // Channel
      if (isChannel) {
        const channelId = await getChannelId(addedURL);
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

        const playlistData = await getPlaylistsData(channelId);
        const videosData = await fetchVideosIds(channelId, [], undefined, true);

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
        setAddedURL("");
        return null;
      }

      let playlistID, videoId;
      try {
        let params = new URL(addedURL).searchParams;
        playlistID = params.get("list");
        videoId = params.get("v");
      } catch (error) {
        return console.log(error);
      }

      // Video
      if (videoId && !playlistID) {
        let videoKey = "v=" + videoId;
        if (localStorage.getItem(videoKey)) {
          toast.error("Video Already Added!", toastError);
          setAddedURL("");
          return;
        }

        const data = await getVideosData(videoId);

        await set(videoKey, { id: videoId, description: data.items[0].description });

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
        setAddedURL("");
      } else if (playlistID) {
        // Playlist
        let playlistKey = "pl=" + playlistID;

        if (localStorage.getItem(playlistKey)) {
          toast.error("Playlist Already Added!", toastError);
          setAddedURL("");
          return;
        }

        const playlistData = await getPlaylistsData(playlistID);
        const videosData = await fetchVideosIds(playlistID);

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
      }

      setAddedURL("");
      if (!isChannel && !videoId && !playlistID) {
        setAddedURL("");
        toast.error("Please Enter a Valid URL or Channel!", toastError);
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something Went Wrong, Try again Later!", toastError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <header className="sticky max-sm:pt-12">
      <nav className="relative top-0 z-20 w-full bg-inherit px-2 pb-5 xs:pt-3 sm:pt-4">
        <form className="flex max-h-12 justify-center gap-2 " onSubmit={handleSubmit}>
          <input
            type="text"
            value={addedURL}
            onChange={handleInputChange}
            placeholder="Enter a Video or Playlist URL or Channel Name"
            className="min-w[1rem] w-[65vw] rounded-md border-2 border-neutral-600 bg-neutral-300 px-3 text-neutral-900 placeholder-neutral-700 transition-colors
             duration-300 placeholder:text-sm hover:bg-neutral-200 focus:border-gray-600 
            focus:placeholder-neutral-500 focus-visible:border-[3px] focus-visible:border-neutral-900 focus-visible:bg-neutral-200 focus-visible:outline-none 
            dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:placeholder-neutral-400 dark:hover:bg-black dark:focus:border-gray-500 dark:focus:placeholder-neutral-500
            dark:focus-visible:border-neutral-700 dark:focus-visible:bg-neutral-950 xs:placeholder:text-base sm:text-lg md:w-[30rem] 
            "
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`group flex items-center justify-center rounded-lg border border-blue-800 bg-blue-700 px-4 py-2 text-gray-100 transition duration-300
           hover:border-blue-950 hover:bg-blue-800  hover:text-gray-200 disabled:border-neutral-600
             disabled:bg-neutral-700 dark:border-blue-800 dark:bg-blue-800 dark:hover:border-blue-900 dark:hover:bg-blue-900
             dark:hover:text-gray-200 dark:disabled:border-neutral-600 dark:disabled:bg-neutral-900`}
          >
            <Icons.searchIcon className="h-4 w-4 sm:h-7 sm:w-7" />
          </button>
        </form>
        {isLoading && (
          <div className="absolute -bottom-1 left-1/2 flex items-center justify-center sm:-bottom-[0.35rem]">
            <Icons.spinIcon className="h-3 w-3 animate-spin text-indigo-500 sm:h-4 sm:w-4 " />
          </div>
        )}
      </nav>
    </header>
  );
}
