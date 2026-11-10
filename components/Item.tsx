import { useMutation } from "@tanstack/react-query";
import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Items, Thumbnails } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import LinkWrapper from "./LinkWrapper";
import { getThumbnailInfo } from "@/utils/getThumbnailInfo";
import { safeGetItem, safeParse, subscribeStorageChange } from "@/utils/safeLocalStorage";
import onDeleteItems from "@/utils/onDeleteItem";
import { del } from "idb-keyval";
import { Roboto } from "next/font/google";
import Delete from "@/assets/icons/Delete";
import reduceStringLength from "@/utils/reduceStringLength";
import convertTimeToSeconds from "@/utils/convertTimeToSeconds";
import ItemModalDelete from "./modals/ItemModalDelete";

const font = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

type Params = {
  title: string;
  thumbnails: Thumbnails | undefined;
  id: string;
  type: "Playlist" | "Video";
  duration?: string;
  channel?: string;
  priority?: boolean;
};

export default function Item({ title, thumbnails, id, type, duration, channel, priority = false }: Params) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isSorting } = useSortable({ id, disabled: isModalOpen });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      if (type === "Playlist") {
        // remove playlist from playlists array
        onDeleteItems(id, "playlists");

        queryClient.setQueryData<Items>(["playlists"], (prev) => {
          if (prev === undefined) return prev;

          const newPlaylistsData = prev.items.filter((item) => item.id !== id);
          const newPlaylists = { ...prev, items: newPlaylistsData };
          return newPlaylists;
        });

        await del(`pl=${id}`);
        await del(`plRemoved=${id}`);
      } else if (type === "Video") {
        // remove video from videos array
        onDeleteItems(id, "videos");

        queryClient.setQueryData<Items>(["videos"], (prev) => {
          if (prev === undefined) return prev;

          const newVideosData = prev.items.filter((item) => item.id !== id);
          const newVideos = { ...prev, items: newVideosData };
          return newVideos;
        });

        await del(`v=${id}`);
      }
    },
  });
  const progressJson = useSyncExternalStore(
    subscribeStorageChange,
    () => safeGetItem(`v=${id}`),
    () => null,
  );
  const savedProgress = useMemo(() => safeParse<{ initialTime?: number } | null>(progressJson, null), [progressJson]);


  function onDelete(id?: string) {
    if (!id) return;
    setIsModalOpen(false);
    mutate(id);
  }

  function openModal(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsModalOpen(!isModalOpen);
  }
  const { thumbnailURL = "", hasBlackBars } = useMemo(() => getThumbnailInfo(thumbnails), [thumbnails]);

  let decodedTitled = encodeURIComponent(title);
  let url = !isDragging && !isSorting ? (type === "Playlist" ? `/playlist?list=${id}&title=${decodedTitled}` : `/video?v=${id}&title=${decodedTitled}`) : "#";

  // let url = !isDragging && !isSorting ? (type === "Playlist" ? `/playlist?list=${id}&title=${decodedTitled}` : `/video?v=${id}`) : "#";

  let formattedTitle = type === "Video" ? reduceStringLength(title, 65) : reduceStringLength(title, 90);

  const durationSeconds = duration ? convertTimeToSeconds(duration) : 0;
  const rawProgress = savedProgress?.initialTime && durationSeconds > 0 ? (savedProgress.initialTime / durationSeconds) * 100 : 0;
  const width = `${Math.min(100, Math.max(0, Number.isFinite(rawProgress) ? rawProgress : 0))}%`;
  return (
    <div className={`mt-2 flex flex-col items-center outline-hidden ${isDragging ? "z-50" : "z-10"}`} ref={setNodeRef} style={style}>
      <div className="relative flex cursor-default flex-col items-center justify-center overflow-hidden rounded-md rounded-tr-[3.2px] md:rounded-[9.6px]">
        <div className="group xs:w-[35vw] flex aspect-video w-[50vw] items-center justify-center overflow-hidden rounded-md rounded-tr-[3.2px] select-none md:w-[26vw] md:rounded-[12.8px] lg:w-[20vw] 2xl:w-[16.5vw]">
          <ItemModalDelete
            button={
              <button
                onClick={openModal}
                className={`peer absolute top-0 right-0 z-10 cursor-pointer rounded-bl-md bg-neutral-800 p-1 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:transition-opacity group-hover:duration-100 hover:bg-neutral-900 hover:text-red-500 ${
                  (isDragging || isSorting) && "hidden opacity-0"
                }}`}
                aria-label="Delete Button"
              >
                <Delete className="h-4 w-4" />
              </button>
            }
            deleteText="Delete"
            type={type}
            id={id}
            title={title}
            isLoading={isPending}
            onDelete={onDelete}
          />
          <div className="transition duration-300 peer-hover:scale-105 hover:scale-105" {...attributes} {...listeners}>
            <LinkWrapper href={url} className="cursor-pointer">
              {thumbnailURL ? (
                <Image
                src={thumbnailURL}
                alt={title}
                width={350}
                height={350}
                style={{ width: "100%", height: "auto" }}
                className={` ${isDragging ? "cursor-grabbing" : "cursor-pointer"} aspect-video ${hasBlackBars && "object-cover"}`}
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                unoptimized
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRgACAABXRUJQVlA4WAoAAAAgAAAANQMAzgEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDhMEQAAAC81g3MAB1CKUpSi/4GI6H8AAA=="
              />
              ) : (
                <div role="img" aria-label={`No thumbnail available for ${title}`} className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800" />
              )}
            </LinkWrapper>
          </div>

          {type === "Video" && (
            <>
              <span
                className={`${font.className} absolute right-[2.4px] bottom-[4px] z-10 rounded-lg bg-black px-1 text-[0.65rem] tracking-wide text-white sm:text-[0.8rem]`}
              >
                {duration}
              </span>

              <div className="absolute bottom-0 left-0 z-500 h-[2.72px] bg-red-500" style={{ width: width }}></div>
            </>
          )}
        </div>
      </div>

      <h2 className="min-h-[45px xs:max-w-[192px] max-h-[50px] max-w-[240px] overflow-hidden pt-1 text-center text-[0.875rem] font-medium break-words whitespace-normal text-black max-md:w-[272px] max-sm:w-[240px] sm:max-w-[320px] dark:text-white">
        <Link className="cursor-pointer" href={url}>
          {formattedTitle}
          {type === "Video" && channel && ` - ${channel}`}
        </Link>
      </h2>
    </div>
  );
}
