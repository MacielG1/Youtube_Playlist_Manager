import ArrowRight from "@/assets/icons/ArrowRight";
import { useMediaQuery } from "usehooks-ts";
import { Items } from "@/types";
import { cn } from "@/utils/cn";
import { getThumbnailInfo } from "@/utils/getThumbnailInfo";
import reduceStringSize from "@/utils/reduceStringLength";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

type Props = {
  videosList: Items["items"];
  playVideoAt: (index: number) => void;
  currentVideoIndex: number | null;
  className?: string;
};

export default function VideosListSidebar({ videosList, playVideoAt, currentVideoIndex, className }: Props) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true); // to prevent scrolling on initial mount

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

  function leftClickHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, index: number) {
    if (e.button === 0) {
      e.preventDefault(); // prevent left click default behavior
      playVideoAt(index);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  if (videosList.length === 0) return null;

  return (
    <aside>
      <div
        ref={sidebarRef}
        className={cn(
          "custom-scrollbar right-1 top-0 mx-auto mt-4 flex max-h-[90vh] max-w-fit flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-md border border-neutral-400 p-1 px-2 pr-[16.8px] dark:border-neutral-700 lg:mt-12 1.5xl:right-7 2xl:right-3 3xl:right-11",
          className,
        )}
      >
        {videosList.map((video, i) => {
          const { thumbnailURL = "", hasBlackBars = false } = getThumbnailInfo(video.thumbnails);
          const title = reduceStringSize(video.title, 60);
          const url = `/video/v?v=${video.id}&title=${encodeURIComponent(video.title)}`;
          return (
            <div className="relative flex cursor-default flex-col items-center justify-center text-center first:pt-3 last:pb-3" key={video.id}>
              <div className="group flex aspect-video items-center justify-center gap-2 rounded-xl">
                {currentVideoIndex && currentVideoIndex - 1 === i ? (
                  <ArrowRight className="h-2 w-2 text-indigo-500" />
                ) : (
                  <span className="text-center text-xs">{i + 1}</span>
                )}

                <Link onClick={(e) => leftClickHandler(e, i)} href={url} className="flex transition duration-300">
                  <div className="h-auto cursor-pointer overflow-hidden rounded-xl">
                    <Image
                      src={thumbnailURL}
                      alt={video.title}
                      width={is700 ? 150 : is1280 ? 240 : is1500 ? 130 : 150}
                      height={is700 ? 84 : is1280 ? 135 : is1500 ? 73 : 84}
                      className={`rounded-xl transition duration-300 hover:scale-[1.03] ${hasBlackBars ? "-my-[14px]" : "-my-[1px]"} `}
                      priority
                      unoptimized
                    />
                  </div>
                </Link>
              </div>
              <Link
                href={url}
                onClick={(e) => leftClickHandler(e, i)}
                className="w-[160px] max-w-fit overflow-hidden whitespace-normal break-words pl-5 text-xs font-normal text-black dark:text-neutral-100"
              >
                <span className="cursor-pointer">{title}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
