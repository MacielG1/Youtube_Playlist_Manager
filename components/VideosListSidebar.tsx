import ArrowRight from "@/assets/icons/ArrowRight";
import ImageIcon from "@/assets/icons/ImageIcon";
import { useMediaQuery } from "usehooks-ts";
import { Items, Thumbnails } from "@/types";
import { cn } from "@/utils/cn";
import { getThumbnailInfo } from "@/utils/getThumbnailInfo";
import reduceStringSize from "@/utils/reduceStringLength";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type Props = {
  videosList: Items["items"];
  playVideoAt: (index: number) => void;
  currentVideoIndex: number | null;
  className?: string;
  playlistId?: string;
  unavailableVideoIds?: Set<string>;
};

export default function VideosListSidebar({ videosList, playVideoAt, currentVideoIndex, className, playlistId, unavailableVideoIds }: Props) {
  const queryClient = useQueryClient();
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);

  const is700 = useMediaQuery("(max-width: 700px)");
  const is1280 = useMediaQuery("(max-width: 1280px)");
  const is1500 = useMediaQuery("(max-width: 1500px)");

  useEffect(() => {
    if (sidebarRef.current && currentVideoIndex !== null) {
      const item = sidebarRef.current.children[currentVideoIndex - 1] as HTMLElement;
      if (item) {
        let scrollAmount;
        if (window.innerWidth < 500) {
          scrollAmount = item.offsetTop - 500;
        } else if (window.innerWidth < 700) {
          scrollAmount = item.offsetTop - 610;
        } else if (window.innerWidth < 900) {
          scrollAmount = item.offsetTop - 700;
        } else if (window.innerWidth < 1280) {
          scrollAmount = item.offsetTop - 850;
        } else {
          scrollAmount = item.offsetTop - 10;
        }

        if (isInitialMount.current) {
          sidebarRef.current.scrollTop = scrollAmount;
          isInitialMount.current = false;
        } else {
          sidebarRef.current.scrollTo({
            top: scrollAmount,
            behavior: "smooth",
          });
        }
      }
    }
  }, [currentVideoIndex, videosList]);

  function leftClickHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, oneBasedIndex: number) {
    if (e.button === 0) {
      e.preventDefault();
      playVideoAt(oneBasedIndex);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  const processedVideos = useMemo(
    () =>
      videosList.map((video) => {
        const { thumbnailURL = "", hasBlackBars = false } = getThumbnailInfo(video.thumbnails);
        return {
          id: video.id,
          title: video.title,
          shortTitle: reduceStringSize(video.title, 60),
          thumbnailURL,
          hasBlackBars,
          thumbnails: video.thumbnails,
          url: `/video/v?v=${video.id}&title=${encodeURIComponent(video.title)}`,
        };
      }),
    [videosList]
  );

  if (videosList.length === 0) return null;

  return (
    <aside>
      <div
        ref={sidebarRef}
        className={cn(
          "custom-scrollbar 1.5xl:right-7 3xl:right-11 top-0 right-1 mx-auto mt-4 flex max-h-[90vh] max-w-fit flex-col gap-3 overflow-x-hidden overflow-y-auto rounded-md border border-neutral-400 p-1 px-2 pr-[16.8px] lg:mt-12 2xl:right-3 dark:border-neutral-700",
          className,
        )}
      >
        {processedVideos.map((video, i) => {
          const { thumbnailURL, hasBlackBars, shortTitle, url, thumbnails } = video;
          const isUnavailable = unavailableVideoIds?.has(video.id);
          const oneBasedIndex = i + 1;

          function setAsPlaylistThumbnail(e: React.MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
            if (!playlistId || !thumbnails) return;

            const customThumbnails = JSON.parse(localStorage.getItem("customPlaylistThumbnails") || "{}");
            customThumbnails[playlistId] = thumbnails;
            localStorage.setItem("customPlaylistThumbnails", JSON.stringify(customThumbnails));

            queryClient.setQueryData<Items>(["playlists"], (oldData) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                items: oldData.items.map((item) =>
                  item.id === playlistId ? { ...item, thumbnails: thumbnails as Thumbnails } : item
                ),
              };
            });

            toast.success("Playlist thumbnail updated!", { position: "top-right", duration: 1500 });
          }
          return (
            <div className={`relative flex cursor-default flex-col items-center justify-center text-center first:pt-3 last:pb-3 ${isUnavailable ? "opacity-45" : ""}`} key={video.id}>
              <div className="group flex aspect-video items-center justify-center gap-2 rounded-xl">
                {currentVideoIndex && currentVideoIndex - 1 === i ? (
                  <ArrowRight className="h-2 w-2 text-indigo-500" />
                ) : (
                  <span className="text-center text-xs">{oneBasedIndex}</span>
                )}

                <div className="relative">
                  <Link onClick={(e) => leftClickHandler(e, oneBasedIndex)} href={url} className="flex transition duration-300">
                    <div className="h-auto cursor-pointer overflow-hidden rounded-xl">
                      <Image
                        src={thumbnailURL}
                        alt={video.title}
                        width={is700 ? 150 : is1280 ? 240 : is1500 ? 130 : 150}
                        height={is700 ? 84 : is1280 ? 135 : is1500 ? 73 : 84}
                        className={`rounded-xl transition duration-300 group-hover:scale-[1.03] ${hasBlackBars ? "-my-[14px]" : "-my-[1px]"} `}
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                  </Link>
                  {isUnavailable && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                      <span className="rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">Unavailable</span>
                    </div>
                  )}
                  {playlistId && (
                    <button
                      onClick={setAsPlaylistThumbnail}
                      className="absolute top-0 left-0 z-10 cursor-pointer rounded-br-md bg-neutral-800/80 p-1 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-900 hover:text-indigo-400"
                      title="Set as playlist thumbnail"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <Link
                href={url}
                onClick={(e) => leftClickHandler(e, oneBasedIndex)}
                className={`w-[160px] max-w-fit overflow-hidden pl-5 text-xs font-normal break-words whitespace-normal ${isUnavailable ? "line-through text-neutral-500 dark:text-neutral-500" : "text-black dark:text-neutral-100"}`}
              >
                <span className="cursor-pointer">{shortTitle}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
