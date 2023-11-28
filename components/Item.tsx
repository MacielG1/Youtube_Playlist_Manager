import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteModalContent from "./modals/DeleteModalContent";
import ModalDelete from "./modals/ModalDelete";
import type { Items, Thumbnails } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import LinkWrapper from "./LinkWrapper";
import { getThumbnailInfo } from "@/utils/getThumbnailInfo";
import { del } from "idb-keyval";
import { Roboto } from "next/font/google";
import Delete from "@/assets/icons/Delete";
import reduceStringLength from "@/utils/reduceStringLength";

const font = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

type Params = {
  title: string;
  thumbnails: Thumbnails | undefined;
  id: string;
  type: string;
  duration?: string;
  channel?: string;
};

export default function Item({ title, thumbnails, id, type, duration, channel }: Params) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({ id, disabled: isModalOpen });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => onDelete,
  });

  async function onDelete(id: string) {
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

      await del(`pl=${id}`);
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

      await del(id);
    }
    setIsModalOpen(false);
    mutate();
  }

  function openModal(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  }
  const { thumbnailURL = "", hasBlackBars } = useMemo(() => getThumbnailInfo(thumbnails), [thumbnails]);

  let decodedTitled = encodeURIComponent(title);
  let url = !isDragging && !isSorting ? (type === "Playlist" ? `/playlist?list=${id}&title=${decodedTitled}` : `/video?v=${id}&title=${decodedTitled}`) : "#";

  let formattedTitle = reduceStringLength(title, 65);
  return (
    <div className={`mt-2 flex  flex-col items-center outline-none ${isDragging ? "z-50" : "z-10"}`} ref={setNodeRef} style={style}>
      <div className="relative flex  cursor-default flex-col items-center justify-center ">
        <div className="group flex aspect-video w-[50vw] select-none items-center justify-center  overflow-hidden rounded-xl xs:w-[35vw] md:w-[26vw] lg:w-[20vw] 2xl:w-[16.5vw] ">
          <button
            onClick={openModal}
            className={`peer absolute right-0 top-0 z-10 rounded-bl-md rounded-tr-[0.50rem] bg-neutral-800 p-1 text-neutral-400 opacity-0 hover:bg-neutral-900 hover:text-red-500 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-500 ${
              (isDragging || isSorting) && "hidden opacity-0"
            }}`}
            aria-label="Delete Button"
          >
            <Delete className="h-4 w-4" />
          </button>
          <div className=" transition duration-300 hover:scale-105 peer-hover:scale-105" {...attributes} {...listeners}>
            <LinkWrapper href={url} className="cursor-pointer ">
              <Image
                src={thumbnailURL}
                alt={title}
                width={350}
                height={350}
                style={{ width: "100%", height: "auto" }}
                className={` ${isDragging ? "cursor-grabbing" : "cursor-pointer"} aspect-video ${hasBlackBars && "object-cover"}`}
                priority
                unoptimized
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRgACAABXRUJQVlA4WAoAAAAgAAAANQMAzgEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDhMEQAAAC81g3MAB1CKUpSi/4GI6H8AAA=="
              />
            </LinkWrapper>
          </div>
          {type === "Video" && (
            <span
              className={`${font.className} absolute bottom-0 right-0 z-10 rounded-tl-lg
             bg-black px-1 text-[0.8rem]  tracking-wide text-white`}
            >
              {duration}
            </span>
          )}
        </div>
      </div>
      <h2 className="md:max-w-30rem] max-h-[2.8rem] min-h-[2.8rem] max-w-[15rem] overflow-hidden whitespace-normal break-words pt-1 text-center text-[0.85rem] font-medium text-black dark:text-white xs:max-w-[12rem] sm:max-w-[20rem]">
        <Link className="cursor-pointer" href={url}>
          {formattedTitle}
          {type === "Video" && channel && ` - ${channel}`}
        </Link>
      </h2>

      {isModalOpen && (
        <ModalDelete
          onClose={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
          content={<DeleteModalContent type={type} id={id} title={title} isLoading={isPending} openModal={openModal} onDelete={onDelete} />}
        />
      )}
    </div>
  );
}
