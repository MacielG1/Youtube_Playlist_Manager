"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Modal from "./Modal";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

let closeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3 h-3"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function PlaylistItem({ title, thumbnail, id, type }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isModalOpen });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const queryClient = useQueryClient();
  const router = useRouter();
  const { mutate, isLoading } = useMutation({
    mutationFn: () => onDelete,
  });

  function onDelete(id) {
    if (type === "playlist") {
      localStorage.removeItem(`pl=${id}`);
      localStorage.removeItem(`plVideos=${id}`);

      // remove playlist from playlists array
      let allPlaylists = JSON.parse(localStorage.getItem("playlists"));
      let newPlaylists = allPlaylists.filter((pl) => pl !== id) || [];
      localStorage.setItem("playlists", JSON.stringify(newPlaylists));
      mutate("playlist");
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    } else if (type === "video") {
      localStorage.removeItem(`v=${id}`);

      // remove video from videos array
      let allVideos = JSON.parse(localStorage.getItem("videos"));
      let newVideos = allVideos.filter((v) => v !== id);

      localStorage.setItem("videos", JSON.stringify(newVideos));
      mutate("video");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    }
  }

  function openModal(e) {
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  }

  let modalContent = (
    <div className="flex flex-col gap-4 items-center justify-center  px-2 pt-2 pb-6 max-w-[16rem] xs:max-w-sm sm:max-w-md">
      <h2 className="text-lg sm:text-2xl text-red-500 font-semibold  tracking-wide">Confirm Deletion</h2>

      <h3 className="text-neutral-400 sm:text-lg text-center font-semibold px-5 pt-2 max-w-[16rem] xs:max-w-sm  sm:max-w-md break-words">
        Delete {type} - <span>{title}</span>
      </h3>

      <div className="flex gap-3 pt-3 text-lg">
        <button
          onClick={openModal}
          className="bg-gray-600/90 border-neutral-800 text-neutral-300 hover:text-neutral-200  cursor-pointer  px-3 py-1 rounded-md hover:bg-gray-700 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onDelete(id)}
          disabled={isLoading}
          className="bg-red-500 border-neutral-800 text-black    cursor-pointer  px-3 py-1 rounded-md hover:bg-[#d32828] transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );

  const thumbnailURL = thumbnail.maxres?.url || thumbnail.standard?.url || thumbnail.high?.url || thumbnail.medium?.url || thumbnail.default?.url;
  // // check if thumbnail includes blackbars
  const noBlackBars = /(maxres|medium)/.test(thumbnailURL);

  function gotoLink() {
    if (type == "playlist") {
      router.push(`/playlist/pl?list=${id}`);
    } else {
      router.push(`/video/v?v=${id}`);
    }
  }
  return (
    <div className="mt-2 outline-none" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`flex flex-col group  items-center justify-center space-y-2  w-60 xs:w-52 md:w-56 lg:w-64 xl:w-[17.8rem] 3xl:w-80  ${
          isDragging ? "cursor-grabbing" : "cursor-pointer"
        } `}
        onClick={gotoLink}
      >
        <div className="relative overflow-hidden rounded-lg  ">
          <Image
            src={thumbnailURL}
            alt={title}
            width={300}
            height={300}
            className={`rounded-xl  hover:scale-105 transition duration-300 ${noBlackBars ? "-my-[1px]" : "-my-[32px]"} `}
            unoptimized
            priority
          />
          <button
            onClick={openModal}
            className="opacity-0 group-hover:opacity-100 absolute bg-neutral-800/80  text-white  top-0 right-0 p-1 hover:bg-neutral-900/90  hover:text-red-500 group-hover:transition-opacity group-hover:duration-500 rounded-bl-md"
          >
            {closeIcon}
          </button>
        </div>

        <h2 className="text-neutral-300 break-words text-center   text-sm font-normal h-10 overflow-hidden whitespace-normal max-w-[15rem] md:max-w-[19rem] ">{title}</h2>
      </div>

      {isModalOpen && <Modal onClose={openModal} content={modalContent} />}
    </div>
  );
}
