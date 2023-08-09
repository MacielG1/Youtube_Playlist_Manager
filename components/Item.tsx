"use client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import DeleteModalContent from "./DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";
import { Playlist, Thumbnails } from "@/types";
import { Icons } from "@/assets/Icons";

type Params = {
  title: string;
  thumbnail: Thumbnails | undefined;
  id: string;
  type: string;
  setOnDelete: React.Dispatch<React.SetStateAction<Playlist[]>>;
};

export default function Item({ title, thumbnail, id, type, setOnDelete }: Params) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: isModalOpen });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const router = useRouter();
  const { mutate, isLoading } = useMutation({
    mutationFn: async () => onDelete,
  });

  function onDelete(id: string) {
    if (type === "Playlist") {
      localStorage.removeItem(`pl=${id}`);
      localStorage.removeItem(`plVideos=${id}`);

      // remove playlist from playlists array
      const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
      const newPlaylists = allPlaylists.filter((pl: string) => pl !== id);

      localStorage.setItem("playlists", JSON.stringify(newPlaylists));
      mutate();

      setOnDelete((prev) => {
        const newPlsData = prev.filter((item) => item.id !== id);
        return newPlsData;
      });
      setIsModalOpen(false);
    } else if (type === "Video") {
      localStorage.removeItem(`v=${id}`);

      // remove video from videos array
      const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");
      const newVideos = allVideos.filter((v: string) => v !== id);

      localStorage.setItem("videos", JSON.stringify(newVideos));
      mutate();

      setOnDelete((prev) => {
        const newVideosData = prev.filter((item) => item.id !== id);
        return newVideosData;
      });
      setIsModalOpen(false);
    }
  }

  function openModal(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  }

  const thumbnailURL = thumbnail?.maxres?.url || thumbnail?.standard?.url || thumbnail?.high?.url || thumbnail?.medium?.url || thumbnail?.default?.url || "";
  // // check if thumbnail includes blackbars
  const noBlackBars = /(maxres|medium)/.test(thumbnailURL);

  function gotoLink() {
    if (type == "Playlist") {
      router.push(`/playlist/p?list=${id}&title=${title}`);
    } else {
      router.push(`/video/v?v=${id}&title=${title}`);
    }
  }

  return (
    <div className="mt-2 outline-none" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`flex flex-col  items-center justify-center space-y-2 w-60 xs:w-52 md:w-56 lg:w-64 xl:w-[17.8rem] 3xl:w-80  ${
          isDragging ? "cursor-grabbing" : "cursor-pointer"
        } `}
        onClick={gotoLink}
      >
        <div className="relative overflow-hidden rounded-lg group">
          <button
            onClick={openModal}
            className="opacity-0 group-hover:opacity-100 z-10 peer absolute bg-neutral-800  text-neutral-400 hover:text-red-500 top-0 right-0 p-1 hover:bg-neutral-900 group-hover:transition-opacity group-hover:duration-500 rounded-bl-md"
            aria-label="Delete Button"
          >
            <Icons.deleteIcon className="w-4 h-4" />
          </button>
          <Image
            src={thumbnailURL}
            alt={title}
            width={300}
            height={300}
            className={`rounded-xl peer-hover:scale-105 hover:scale-105 transition duration-300 ${noBlackBars ? "-my-[1px]" : "-my-[32px]"} `}
            priority
          />
        </div>

        <h2 className="text-black dark:text-white break-words text-center text-sm font-normal h-10 overflow-hidden whitespace-normal max-w-[15rem] md:max-w-[19rem]">
          {title}
        </h2>
      </div>

      {isModalOpen && (
        <ModalDelete
          onClose={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
          content={<DeleteModalContent type={type} id={id} title={title} isLoading={isLoading} openModal={openModal} onDelete={onDelete} />}
        />
      )}
    </div>
  );
}
