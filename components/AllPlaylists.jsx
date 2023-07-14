// "use client";
// import PlaylistItem from "./PlaylistItem";
// import { useQuery } from "@tanstack/react-query";
// import getPlaylistsData from "@/utils/getPlaylistsData";
// import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
// import { SortableContext, arrayMove } from "@dnd-kit/sortable";
// import { useEffect, useState } from "react";
// let spin = (
//   <div role="status">
//     <svg
//       aria-hidden="true"
//       className="w-5 h-5 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
//       viewBox="0 0 100 101"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//         fill="currentColor"
//       />
//       <path
//         d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//         fill="currentFill"
//       />
//     </svg>
//     <span className="sr-only">Loading...</span>
//   </div>
// );

// export default function AllPlaylists() {
//   const [items, setPlaylistItems] = useState([]);

//   useEffect(() => {
//     if (items.length > 0) {
//       localStorage.setItem("playlists", JSON.stringify(items.map((item) => item.id)));
//     }
//   }, [items]);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     })
//   );

//   const { isLoading, isError } = useQuery({
//     queryKey: ["playlists"],
//     queryFn: getPlaylistsData,
//     onSuccess: (data) => {
//       setPlaylistItems(data?.items || []);
//     },
//     refetchOnWindowFocus: false,
//   });

//   if (isLoading) return <div className="mx-auto flex justify-center">{spin}</div>;
//   if (isError) return <div>Error</div>;

//   function handleDragEnd(e) {
//     const { active, over } = e;

//     if (active.id !== over.id) {
//       setPlaylistItems((items) => {
//         let activeIndex = items.findIndex((item) => item.id === active.id);
//         let overIndex = items.findIndex((item) => item.id === over.id);

//         return arrayMove(items, activeIndex, overIndex);
//       });
//     }
//   }

//   return (
//     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//       <SortableContext items={items}>
//         <div className="pl-3 sm:pl-10 pt-4 sm:flex gap-4">
//           {items?.length > 0 &&
//             items?.map((playlist) => (
//               <PlaylistItem key={playlist.id} id={playlist.id} title={playlist.snippet.title} thumbnail={playlist.snippet.thumbnails} />
//             ))}
//           {items?.length === 0 && <div className="text-gray-400 mx-auto pt-10 text-lg">Please add a New Playlist URL</div>}
//         </div>
//       </SortableContext>
//     </DndContext>
//   );
// }

"use client";
import PlaylistItem from "./PlaylistItem";
import { useQuery } from "@tanstack/react-query";
import getPlaylistsData from "@/utils/getPlaylistsData";
import getVideosData from "@/utils/getVideosData";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import spin from "@/assets/spinIcon.svg";
import emptyBox from "@/assets/emptybox.svg";
import Image from "next/image";
import Link from "next/link";

export default function AllPlaylists() {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [videoItems, setVideoItems] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const {
    isPlLoading,
    isPlError,
    isFetching: isPlFetching,
    data: plData,
    isFetched: isPlFetched,
  } = useQuery({
    queryKey: ["playlists"],
    queryFn: getPlaylistsData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const {
    isVidLoading,
    data: vidData,
    isFetching: isVidFetching,
    isFetched: isVidFetched,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: getVideosData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // useEffect related to the react-query data
  useEffect(() => {
    setPlaylistItems(plData?.items || []);
  }, [plData]);

  useEffect(() => {
    setVideoItems(vidData?.items || []);
  }, [vidData]);

  // useEffect related to the Drag and Drop functionality
  useEffect(() => {
    if (playlistItems.length > 0) {
      localStorage.setItem("playlists", JSON.stringify(playlistItems.map((item) => item.id)));
    }
  }, [playlistItems]);

  useEffect(() => {
    if (videoItems.length > 0) {
      localStorage.setItem("videos", JSON.stringify(videoItems.map((item) => item.id)));
    }
  }, [videoItems]);

  if ((isPlFetching || isVidFetching) && !isPlFetched) {
    return (
      <div className="mx-auto flex justify-center pt-2">
        <Image src={spin} alt="skip 10 seconds" unoptimized width={24} height={24} className="animate-spin" />
      </div>
    );
  }
  if (isPlError) return <div>Error</div>;

  function handleDragEnd(e, setter) {
    const { active, over } = e;

    if (active.id !== over.id) {
      setter((items) => {
        let activeIndex = items.findIndex((item) => item.id === active.id);
        let overIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, activeIndex, overIndex);
      });
    }
  }

  return (
    <>
      {!vidData?.items?.length && !plData?.items?.length && (
        <div className="flex items-center flex-col gap-3 pt-10">
          {/* <h1 className=" text-neutral-400 text-2xl font-semibold">Youtube Playlist Manager</h1> */}

          <h3 className=" text-neutral-400 text-lg font-semibold tracking-wide">No Items Added</h3>
          <Image src={emptyBox} alt="skip 10 seconds" unoptimized width={52} height={52} />
          <Link
            href="/about"
            className="bg-neutral-800 hover:bg-neutral-800/80 py-2 px-4 my-5 text-neutral-300 hover:text-neutral-300/80 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Learn how it works
          </Link>
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setPlaylistItems)}>
        {playlistItems?.length > 0 && (
          <SortableContext items={playlistItems}>
            <>
              {videoItems?.length > 0 && (
                <h2 className="md:pl-24 sm:pl-8 xl:pl-24 text-center md:text-left mt-6  text-zinc-300/90 font-semibold tracking-wide ">Playlists</h2>
              )}
              <div className="pl-3 sm:pl-7 pt-4 grid grid-cols-1 gap-y-2  xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
                {playlistItems?.map((playlist) => (
                  <PlaylistItem key={playlist.id} id={playlist.id} title={playlist.snippet.title} thumbnail={playlist.snippet.thumbnails} type={"playlist"} />
                ))}
              </div>
            </>
          </SortableContext>
        )}
      </DndContext>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setVideoItems)}>
        {videoItems?.length > 0 && (
          <SortableContext items={videoItems}>
            <>
              <h1 className="md:pl-24 sm:pl-8 xl:pl-24  text-center md:text-left mt-6 text-zinc-300/90 font-semibold tracking-wide ">Videos</h1>
              <div className="pl-3 sm:pl-7 pt-4 grid grid-cols-1 gap-y-2 xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
                {videoItems?.map((video) => (
                  <PlaylistItem key={video.id} id={video.id} title={video.snippet.title} thumbnail={video.snippet.thumbnails} type={"video"} />
                ))}
              </div>
            </>
          </SortableContext>
        )}
      </DndContext>
    </>
  );
}
