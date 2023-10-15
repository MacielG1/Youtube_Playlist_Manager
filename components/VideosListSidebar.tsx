import { Icons } from "@/assets/Icons";
import useWindowWidth from "@/hooks/useWindowWidth";
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

  const windowWidth = useWindowWidth();

  useEffect(() => {
    if (sidebarRef.current && currentVideoIndex !== null) {
      const item = sidebarRef.current.children[currentVideoIndex - 1] as HTMLElement;
      if (item) {
        let scrollAmount;
        if (window.innerWidth > 1280) {
          scrollAmount = item.offsetTop - 10;
        } else {
          scrollAmount = item.offsetTop - 700;
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
    }
  }

  return (
    <aside>
      {videosList.length > 0 && (
        <div
          ref={sidebarRef}
          className={cn(
            "custom-scrollbar right-1 top-0 mt-4 flex max-h-[90vh] flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-md border border-neutral-400 p-1 px-2 pr-[1.05rem] dark:border-neutral-700 lg:mt-12 1.5xl:right-5 2xl:right-11",
            className,
          )}
        >
          {videosList.map((video, i) => {
            const { thumbnailURL = "", noBlackBars = false } = getThumbnailInfo(video.thumbnails);
            const title = reduceStringSize(video.title, 60);
            const url = `/video/v?v=${video.id}&title=${encodeURIComponent(video.title)}`;
            return (
              <div className="relative flex cursor-default flex-col items-center justify-center text-center first:pt-3 last:pb-3" key={video.id}>
                <div className="group flex aspect-video items-center justify-center gap-2 rounded-xl">
                  <span className="text-center text-xs">
                    {currentVideoIndex && currentVideoIndex - 1 === i ? <Icons.arrowRight className="h-5 w-5 text-indigo-500" /> : i + 1}
                  </span>
                  <Link onClick={(e) => leftClickHandler(e, i)} href={url} className="flex transition duration-300">
                    <div className="h-auto cursor-pointer overflow-hidden rounded-xl">
                      <Image
                        src={thumbnailURL}
                        alt={video.title}
                        width={150}
                        height={150}
                        style={{ width: windowWidth < 700 ? "40vw" : windowWidth < 1280 ? "25vw" : windowWidth < 1500 ? "130px" : "150px", height: "auto" }}
                        // styles height needs to be auto for no layout shift to happen when hovering
                        className={`rounded-xl transition duration-300 hover:scale-[1.03] ${noBlackBars ? "-my-[1px]" : "-my-[14px]"} `}
                        priority
                        unoptimized
                      />
                    </div>
                  </Link>
                </div>
                <Link
                  href={url}
                  onClick={(e) => leftClickHandler(e, i)}
                  className="w-[10rem] max-w-fit overflow-hidden whitespace-normal break-words pl-5 text-xs font-normal text-black dark:text-neutral-100"
                >
                  <span className="cursor-pointer">{title}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
