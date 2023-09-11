"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Icons } from "@/assets/Icons";
import { Items } from "@/types";
import { toastError } from "@/utils/toastStyles";
import getChannelId from "@/utils/createChannelPlaylist";
import toast from "react-hot-toast";
import getVideosData from "@/utils/getVideosData";
import getPlaylistsData from "@/utils/getPlaylistsData";

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

      if (isChannel) {
        const channelId = await getChannelId(addedURL);
        setAddedURL("");

        if (!channelId) {
          toast.error("Invalid Input!", toastError);
          return null;
        }
        const playlistKey = "pl=" + channelId;
        if (localStorage.getItem(playlistKey)) {
          toast.error("Playlist Already Added!", toastError);
          return null;
        }

        localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));
        // Saving playlist to all playlists Array
        const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
        localStorage.setItem("playlists", JSON.stringify([...allPlaylists, channelId]));

        const data = await getPlaylistsData(channelId);

        // Updating the query data with the new playlist
        if (data?.items?.length) {
          queryClient.setQueryData<Items>(["playlists"], (prev) => {
            if (!prev || !prev?.items?.length) return data;

            return {
              ...data,
              items: [...prev.items, ...data.items],
            };
          });
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

      // Saving specific video data
      if (videoId && !playlistID) {
        let videoKey = "v=" + videoId;
        if (localStorage.getItem(videoKey)) {
          setAddedURL("");
          return;
        }
        localStorage.setItem(videoKey, JSON.stringify({ initialTime: 0 }));

        // Saving video to all videos Array
        const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");
        localStorage.setItem("videos", JSON.stringify([...allVideos, videoId]));

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
        } else {
          toast.error("Video is Invalid or Private!", toastError);
          localStorage.removeItem(videoKey);
        }
        setAddedURL("");
      } else if (playlistID) {
        // if it's a playlist
        let playlistKey = "pl=" + playlistID;

        if (localStorage.getItem(playlistKey)) {
          setAddedURL("");
          return;
        }
        localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));

        // Saving playlist to all playlists Array
        const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
        localStorage.setItem("playlists", JSON.stringify([...allPlaylists, playlistID]));

        const data = await getPlaylistsData(playlistID);

        // Updating the query data with the new playlist
        if (data?.items?.length) {
          queryClient.setQueryData<Items>(["playlists"], (prev) => {
            if (!prev || !prev?.items?.length) return data;

            return {
              ...data,
              items: [...prev.items, ...data.items],
            };
          });
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
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <nav className="sticky top-0 z-20 w-full bg-inherit px-2 pb-3 pt-1 sm:pb-2 sm:pt-4 ">
      <form className="flex max-h-12 justify-center gap-2 " onSubmit={handleSubmit}>
        <input
          type="text"
          value={addedURL}
          onChange={handleInputChange}
          placeholder="Enter a Video or Playlist URL or a Channel Name"
          className="min-w[1rem] w-[65vw] rounded-md border-2 border-neutral-600 bg-neutral-300 px-3 text-lg text-neutral-900 placeholder-neutral-700
             transition-colors duration-300 placeholder:text-base 
            hover:bg-neutral-200 focus:border-gray-600 focus:placeholder-neutral-500 focus-visible:border-[3px] focus-visible:border-neutral-900 
            focus-visible:bg-neutral-200 focus-visible:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-300 dark:placeholder-neutral-400 dark:hover:bg-black
            dark:focus:border-gray-500 dark:focus:placeholder-neutral-500 dark:focus-visible:border-neutral-700 dark:focus-visible:bg-neutral-950 md:w-[30rem] 
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
    </nav>
  );
}
