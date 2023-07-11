"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg";

export default function Input() {
  const [addedURL, setAddedURL] = useState("");

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: () => handleButtonClick,
  });

  function handleInputChange(e) {
    setAddedURL(e.target.value);
  }

  const handleButtonClick = () => {
    if (!addedURL) return;
    if (!addedURL.includes("youtube.com")) {
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
    } else {
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
    }
    if (playlistID) {
      mutate("playlist");
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    } else {
      mutate("video");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    }

    setAddedURL("");
  };

  return (
    <nav className="sticky top-0 z-20 mb-2 mt-3 px-2">
      <div className="flex justify-center gap-2 ">
        <input
          type="text"
          value={addedURL}
          onChange={handleInputChange}
          placeholder="Enter a URL"
          className=" w-[70vw] md:w-[30rem] min-w[1rem] text-neutral-400 text-lg px-3 border-gray-600 border-2 rounded-md bg-neutral-950  focus:outline-none focus:bg-neutral-950 placeholder-gray-400 placeholder:text-base focus:placeholder-neutral-500 focus:border-gray-500 "
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
