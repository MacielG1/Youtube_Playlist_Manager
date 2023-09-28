import { Items } from "@/types";
import { getThumbnailInfo } from "@/utils/getThumbnailInfo";
import reduceStringSize from "@/utils/reduceStringLength";
import Image from "next/image";

type Props = {
  videosList: Items["items"];
};

export default function PlaylistSidebar({ videosList }: Props) {
  console.log(videosList);
  if (videosList.length <= 0) return null;
  return (
    <div className=" flex flex-col items-center gap-1 xs:gap-2">
      {videosList.map((video) => {
        console.log(video);
        const { thumbnailURL = "", noBlackBars = false } = getThumbnailInfo(video.thumbnails);
        const title = reduceStringSize(video.title, 60);
        return (
          <div className="relative flex cursor-default items-center justify-center gap-4" key={video.id}>
            <div className="group aspect-video overflow-hidden rounded-xl">
              <div className="transition duration-300 hover:scale-105 peer-hover:scale-105">
                <div className="h-auto w-full cursor-pointer">
                  <Image
                    src={thumbnailURL}
                    alt={video.title}
                    width={150}
                    height={150}
                    className={`rounded-xl ${noBlackBars ? "-my-[1px]" : "-my-[32px]"} `}
                    priority
                    unoptimized
                    placeholder="blur"
                    blurDataURL="data:image/webp;base64,UklGRgACAABXRUJQVlA4WAoAAAAgAAAANQMAzgEASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDhMEQAAAC81g3MAB1CKUpSi/4GI6H8AAA=="
                  />
                </div>
              </div>
            </div>

            <h2 className="w-[10rem] overflow-hidden whitespace-normal break-words text-xs font-medium text-black dark:text-white md:max-w-[18rem]">
              <span className="cursor-pointer">{title}</span>
            </h2>
          </div>
        );
      })}
    </div>
  );
}
