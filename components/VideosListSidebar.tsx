import { Icons } from "@/assets/Icons";
import useWindowWidth from "@/hooks/useWindowWidth";
import { Items } from "@/types";
import { cn } from "@/utils/cn";
import { getThumbnailInfo } from "@/utils/getThumbnailInfo";
import reduceStringSize from "@/utils/reduceStringLength";
import Image from "next/image";
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

  console.log("videosList", videosList);
  return (
    <aside>
      {videosList.length > 0 && (
        <div
          ref={sidebarRef}
          className={cn(
            "custom-scrollbar right-1 top-0 mt-12 flex max-h-[90vh] flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-md border border-neutral-400 p-1 px-2 pr-4 dark:border-neutral-700 1.5xl:right-5 2xl:right-11",
            className,
          )}
        >
          {videosList.map((video, i) => {
            const { thumbnailURL = "", noBlackBars = false } = getThumbnailInfo(video.thumbnails);
            const title = reduceStringSize(video.title, 60);
            return (
              <div className="relative flex cursor-default flex-col items-center justify-center text-center first:pt-3 last:pb-3" key={video.id}>
                <div className="group flex aspect-video items-center justify-center gap-2 rounded-xl">
                  <span className="text-center text-xs">
                    {currentVideoIndex && currentVideoIndex - 1 === i ? <Icons.arrowRight className="h-5 w-5 text-indigo-500" /> : i + 1}
                  </span>
                  <div className="flex transition duration-300" onClick={() => playVideoAt(i)}>
                    <div className="h-auto cursor-pointer overflow-hidden rounded-xl">
                      <Image
                        src={thumbnailURL}
                        alt={video.title}
                        width={150}
                        height={150}
                        style={{ width: windowWidth < 700 ? "40vw" : windowWidth < 1280 ? "25vw" : windowWidth < 1500 ? "130px" : "150px", height: "auto" }}
                        className={`rounded-xl transition duration-300 hover:scale-[1.03] ${noBlackBars ? "-my-[1px]" : "-my-[14px]"} `}
                        priority
                        unoptimized
                      />
                    </div>
                  </div>
                </div>
                <h2 className="w-[10rem] max-w-fit overflow-hidden whitespace-normal break-words pl-5 text-xs font-normal text-black dark:text-neutral-100">
                  <span className="cursor-pointer" onClick={() => playVideoAt(i)}>
                    {title}
                  </span>
                </h2>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
