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
  const queryClient = useQueryClient();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddedURL(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
  }

  return (
    <nav className="sticky bg-inherit top-0 z-20 w-full  pb-3 sm:pb-2 pt-1 sm:pt-4 px-2 ">
      <form className="flex justify-center gap-2 max-h-12 " onSubmit={handleSubmit}>
        <input
          type="text"
          value={addedURL}
          onChange={handleInputChange}
          placeholder="Enter a Video or Playlist URL or a Channel Name"
          className=" w-[65vw] md:w-[30rem] min-w[1rem] text-lg px-3 border-2 rounded-md placeholder:text-base focus-visible:outline-none focus-visible:border-[3px]
             text-neutral-900 bg-neutral-300 border-neutral-600   
            focus-visible:bg-neutral-200 placeholder-neutral-700 focus-visible:border-neutral-900 focus:placeholder-neutral-500 focus:border-gray-600  
            dark:text-neutral-300 dark:bg-neutral-900 dark:border-neutral-600 dark:hover:bg-black hover:bg-neutral-200 transition-colors duration-300
            dark:focus-visible:bg-neutral-950 dark:placeholder-neutral-400 dark:focus-visible:border-neutral-700 dark:focus:placeholder-neutral-500 dark:focus:border-gray-500 
            "
        />
        <button
          type="submit"
          className={`flex items-center justify-center rounded-lg  border border-blue-800 bg-blue-700  hover:bg-blue-800 text-gray-100 px-4 py-2 hover:border-blue-950 hover:text-gray-200 transition duration-300`}
        >
          <Icons.searchIcon className="w-4 h-4 sm:w-7 sm:h-7" />
        </button>
      </form>
    </nav>
  );
}
