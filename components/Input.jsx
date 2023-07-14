"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg";
import getChannelId from "@/utils/createChannelPlaylist";

export default function Input() {
  const [addedURL, setAddedURL] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: () => handleButtonClick,
  });

  function handleInputChange(e) {
    setAddedURL(e.target.value);
  }

  const handleButtonClick = async () => {
    if (!addedURL) return;

    const isChannel = !/(list=|v=)/.test(addedURL);

    if (isChannel) {
      let channelId = await getChannelId(addedURL);
      let playlistKey = "pl=" + channelId;
      if (localStorage.getItem(playlistKey)) {
        setAddedURL("");
        return;
      }

      localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));

      // Saving playlist to all playlists Array
      const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
      localStorage.setItem("playlists", JSON.stringify([...allPlaylists, channelId]));

      mutate("playlist");
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      setAddedURL("");
      return;
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

      mutate("video");
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

      mutate("playlist");
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    }

    setAddedURL("");
  };

  return (
    <nav className="sticky top-0 z-20 mb-2 mt-4 px-2">
      <div className="flex justify-center gap-2 ">
        <input
          type="text"
          value={addedURL}
          onChange={handleInputChange}
          placeholder="Enter a Video or Playlist URL or a Channel Name"
          className=" w-[70vw] md:w-[30rem] min-w[1rem] text-neutral-300 text-lg px-3 border-neutral-600 border-2 rounded-md bg-neutral-950
            focus-visible:bg-neutral-950 placeholder-neutral-400 placeholder:text-base
            focus-visible:outline-none focus-visible:border-[3px] focus-visible:border-neutral-700
            focus:placeholder-neutral-500 focus:border-gray-500 "
        />
        <button
          disabled={isLoading}
          onClick={handleButtonClick}
          className={`flex items-center justify-center rounded-lg  border border-blue-800 bg-blue-700  hover:bg-blue-700/80 text-gray-100 px-4 py-2 hover:border-blue-950 hover:text-gray-200 transition duration-300`}
        >
          <Image src={searchIcon} alt="add" unoptimized width={32} height={32} className="min-w-[1rem]" />
        </button>
      </div>
    </nav>
  );
}
