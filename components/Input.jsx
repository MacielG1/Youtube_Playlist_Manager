"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg";
import createChannelPlaylist from "@/utils/createChannelPlaylist";
import toast from "react-hot-toast";

const toastError = {
  duration: 2500,
  style: {
    border: "1px solid #9c0000",
    padding: "12px",
    color: "#a7a7a8",
    backgroundColor: "#000",
  },
  iconTheme: {
    primary: "#9c0000",
    secondary: "#eee",
  },
};

export default function Input() {
  const [addedURL, setAddedURL] = useState("");
  const queryClient = useQueryClient();

  function handleInputChange(e) {
    setAddedURL(e.target.value);
  }

  async function handleButtonClick() {
    if (!addedURL) {
      toast.error("Please Enter a URL!", toastError);
      return;
    }

    const isChannel = !/(list=|v=)/.test(addedURL);

    if (isChannel) {
      const channelId = await createChannelPlaylist(addedURL);

      if (!channelId) {
        setAddedURL("");
        toast.error("Invalid Input!", toastError);

        return null;
      }
      const playlistKey = "pl=" + channelId;
      if (localStorage.getItem(playlistKey)) {
        setAddedURL("");
        toast.error("Playlist Already Added!", toastError);
        return null;
      }

      localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));
      // Saving playlist to all playlists Array
      const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
      localStorage.setItem("playlists", JSON.stringify([...allPlaylists, channelId]));

      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setAddedURL("");
      return null;
    }

    let playlistID, videoId;
    try {
      let params = new URL(addedURL).searchParams;
      playlistID = params.get("list");
      videoId = params.get("v");
    } catch (error) {
      return;
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
      const allVideos = JSON.parse(localStorage.getItem("videos")) || [];
      localStorage.setItem("videos", JSON.stringify([...allVideos, videoId]));

      queryClient.invalidateQueries({ queryKey: ["videos"] });
    } else if (playlistID) {
      // if it's a playlist
      let playlistKey = "pl=" + playlistID;

      if (localStorage.getItem(playlistKey)) {
        setAddedURL("");
        return;
      }
      localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));

      // Saving playlist to all playlists Array
      const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
      localStorage.setItem("playlists", JSON.stringify([...allPlaylists, playlistID]));

      // mutate();
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    }
    setAddedURL("");
    if (!isChannel && !videoId && !playlistID) {
      setAddedURL("");
      toast.error("Please Enter a Valid URL!", toastError);

      return;
    }
  }

  return (
    <nav className="sticky top-0 z-20 mb-3 sm:mb-2 mt-1 sm:mt-4 px-2 ">
      <div className="flex justify-center gap-2 ">
        <input
          type="text"
          value={addedURL}
          onChange={handleInputChange}
          placeholder="Enter a Video or Playlist URL or a Channel Name"
          className=" w-[65vw] md:w-[30rem] min-w[1rem] text-lg px-3 border-2 rounded-md placeholder:text-base focus-visible:outline-none focus-visible:border-[3px]
           text-neutral-900 bg-neutral-300 border-neutral-600   
            focus-visible:bg-neutral-200 placeholder-neutral-700 focus-visible:border-neutral-900 focus:placeholder-neutral-500 focus:border-gray-600  
            dark:text-neutral-300 dark:bg-neutral-950 dark:border-neutral-600  
            dark:focus-visible:bg-neutral-950 dark:placeholder-neutral-400 dark:focus-visible:border-neutral-700 dark:focus:placeholder-neutral-500 dark:focus:border-gray-500 
            "
        />
        <button
          onClick={handleButtonClick}
          className={`flex items-center justify-center rounded-lg  border border-blue-800 bg-blue-700  hover:bg-blue-800 text-gray-100 px-4 py-2 hover:border-blue-950 hover:text-gray-200 transition duration-300`}
        >
          <Image src={searchIcon} alt="add" unoptimized width={32} height={32} className="min-w-[1rem]" />
        </button>
      </div>
    </nav>
  );
}
