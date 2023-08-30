"use client";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import DeleteModalContent from "./modals/DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";
import { Items, Playlist, Thumbnails } from "@/types";
import { Icons } from "@/assets/Icons";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

type Params = {
  title: string;
  thumbnail: Thumbnails | undefined;
  id: string;
  type: string;
  setOnDelete: React.Dispatch<React.SetStateAction<Playlist[]>>;
};

export default function Item({ title, thumbnail, id, type, setOnDelete }: Params) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDraggingItem, setIsDragging] = useState(false);
  const [isSortingItem, setIsSorting] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({ id, disabled: isModalOpen });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: async () => onDelete,
  });

  useEffect(() => {
    setIsDragging(isDragging);
  }, [isDragging]);

  useEffect(() => {
    setIsSorting(isSorting);
  }, [isSorting]);

  function onDelete(id: string) {
    if (type === "Playlist") {
      localStorage.removeItem(`pl=${id}`);
      localStorage.removeItem(`plVideos=${id}`);

      // remove playlist from playlists array
      const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
      const newPlaylists = allPlaylists.filter((pl: string) => pl !== id);

      localStorage.setItem("playlists", JSON.stringify(newPlaylists));

      queryClient.setQueryData<Items>(["playlists"], (prev) => {
        if (prev === undefined) return prev;

        const newPlaylistsData = prev.items.filter((item: any) => item.id !== id);
        const newPlaylists = { ...prev, items: newPlaylistsData };
        return newPlaylists;
      });

      setOnDelete((prev) => {
        const newPlsData = prev.filter((item) => item.id !== id);
        return newPlsData;
      });
      setIsModalOpen(false);
      mutate();
    } else if (type === "Video") {
      localStorage.removeItem(`v=${id}`);

      // remove video from videos array
      const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");
      const newVideos = allVideos.filter((v: string) => v !== id);

      localStorage.setItem("videos", JSON.stringify(newVideos));

      queryClient.setQueryData<Items>(["videos"], (prev) => {
        if (prev === undefined) return prev;

        const newVideosData = prev.items.filter((item) => item.id !== id);
        const newVideos = { ...prev, items: newVideosData };
        return newVideos;
      });

      setOnDelete((prev) => {
        const newVideosData = prev.filter((item) => item.id !== id);
        return newVideosData;
      });
      setIsModalOpen(false);
      mutate();
    }
  }

  function openModal(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  }

  let thumbnailURL;
  let noBlackBars;
  if (window.innerWidth <= 720) {
    thumbnailURL = thumbnail?.medium?.url || thumbnail?.default?.url || "";
    noBlackBars = true;
  } else {
    thumbnailURL = thumbnail?.maxres?.url || thumbnail?.standard?.url || thumbnail?.high?.url || thumbnail?.medium?.url || thumbnail?.default?.url || "";
    noBlackBars = /(maxres|medium)/.test(thumbnailURL); // if it's maxres or medium it doesn't have blackbars
  }

  function gotoLink() {
    if (type == "Playlist") {
      router.push(`/playlist/p?list=${id}&title=${title}`);
    } else {
      router.push(`/video/v?v=${id}&title=${title}`);
    }
  }
  let t = encodeURIComponent(title);
  let url = !isDraggingItem && !isSortingItem ? (type === "Playlist" ? `/playlist/p?list=${id}&title=${t}` : `/video/v?v=${id}&title=${t}`) : "#";

  return (
    <div className="mt-2 outline-none" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="relative w-60 xs:w-52 md:w-56 lg:w-64 xl:w-[17.8rem] 3xl:w-80 ">
          <div className="overflow-hidden group rounded-xl  w-full h-full ">
            <button
              onClick={openModal}
              className="opacity-0 group-hover:opacity-100 z-10 peer absolute bg-neutral-800 text-neutral-40 hover:text-red-500 top-0 right-0 p-1 hover:bg-neutral-900 group-hover:transition-opacity group-hover:duration-500 rounded-bl-md rounded-tr-[0.50rem]    "
              aria-label="Delete Button"
            >
              <Icons.deleteIcon className="w-4 h-4" />
            </button>
            <div className="peer-hover:scale-105 hover:scale-105 transition duration-300 ">
              <Link href={url}>
                <Image
                  src={thumbnailURL}
                  alt={title}
                  width={300}
                  height={300}
                  className={`rounded-xl ${noBlackBars ? "-my-[1px]" : "-my-[32px]"} ${isDragging ? "cursor-grabbing" : "cursor-pointer"} `}
                  priority
                  unoptimized
                />
              </Link>
            </div>
          </div>

          <h2 className="pt-1 text-black dark:text-white  break-words text-center text-sm font-normal h-10 overflow-hidden whitespace-normal max-w-[15rem] md:max-w-[19rem]">
            <span onClick={gotoLink} className="cursor-pointer">
              {title}
            </span>
          </h2>
        </div>
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
