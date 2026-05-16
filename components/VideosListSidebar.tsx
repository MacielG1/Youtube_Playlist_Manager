import ArrowRight from "@/assets/icons/ArrowRight";
import ImageIcon from "@/assets/icons/ImageIcon";
import { Items, Thumbnails } from "@/types";
import { cn } from "@/utils/cn";
import { getThumbnailInfo } from "@/utils/getThumbnailInfo";
import reduceStringSize from "@/utils/reduceStringLength";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useMemo, useState } from "react";
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
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  const is700 = viewportWidth <= 700;
  const is1280 = viewportWidth <= 1280;
  const is1500 = viewportWidth <= 1500;

  const itemHeight = is1280 && !is700 ? 184 : is1500 && !is1280 ? 122 : 132;

  useEffect(() => {
    if (sidebarRef.current && currentVideoIndex !== null) {
      let scrollOffset;
      if (window.innerWidth < 500) {
        scrollOffset = 500;
      } else if (window.innerWidth < 700) {
        scrollOffset = 610;
      } else if (window.innerWidth < 900) {
        scrollOffset = 700;
      } else if (window.innerWidth < 1280) {
        scrollOffset = 850;
      } else {
        scrollOffset = 10;
      }

      const scrollAmount = (currentVideoIndex - 1) * itemHeight - scrollOffset;

      if (isInitialMount.current) {
        sidebarRef.current.scrollTop = scrollAmount;
        setScrollTop(scrollAmount);
        isInitialMount.current = false;
      } else {
        sidebarRef.current.scrollTo({
          top: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  }, [currentVideoIndex, itemHeight, videosList.length]);

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

  const visibleRange = useMemo(() => {
    const viewportHeight = sidebarRef.current?.clientHeight || 900;
    const overscan = 8;
    const viewportItems = Math.ceil(viewportHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(videosList.length, start + viewportItems + overscan * 2);

    return { start, end };
  }, [itemHeight, scrollTop, videosList.length]);

  const processedVideos = useMemo(
    () =>
      videosList.slice(visibleRange.start, visibleRange.end).map((video, index) => {
        const { thumbnailURL = "", hasBlackBars = false } = getThumbnailInfo(video.thumbnails);
        return {
          id: video.id,
          title: video.title,
          shortTitle: reduceStringSize(video.title, 60),
          thumbnailURL,
          hasBlackBars,
          thumbnails: video.thumbnails,
          url: `/video/v?v=${video.id}&title=${encodeURIComponent(video.title)}`,
          originalIndex: visibleRange.start + index,
        };
      }),
    [videosList, visibleRange]
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
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        {visibleRange.start > 0 && <div aria-hidden style={{ height: visibleRange.start * itemHeight, flex: "0 0 auto" }} />}
        {processedVideos.map((video) => {
          const { thumbnailURL, hasBlackBars, shortTitle, url, thumbnails } = video;
          const isUnavailable = unavailableVideoIds?.has(video.id);
          const oneBasedIndex = video.originalIndex + 1;

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
                {currentVideoIndex && currentVideoIndex - 1 === video.originalIndex ? (
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
        {visibleRange.end < videosList.length && <div aria-hidden style={{ height: (videosList.length - visibleRange.end) * itemHeight, flex: "0 0 auto" }} />}
      </div>
    </aside>
  );
}
