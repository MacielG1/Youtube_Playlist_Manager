// "use client";
// import PlaylistItem from "./PlaylistItem";
// import { useQuery } from "@tanstack/react-query";
// import getPlaylistsData from "@/utils/getPlaylistsData";
// import getVideosData from "@/utils/getVideosData";
// import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
// import { SortableContext, arrayMove } from "@dnd-kit/sortable";
// import { useEffect, useState } from "react";
// import spin from "@/assets/spinIcon.svg";
// import emptyBox from "@/assets/emptyBox.svg";
// import Image from "next/image";
// import Link from "next/link";

// export default function AllPlaylists() {
//   const [playlistItems, setPlaylistItems] = useState([]);
//   const [videoItems, setVideoItems] = useState([]);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     })
//   );

//   const {
//     isPlLoading,
//     isPlError,
//     isFetching: isPlFetching,
//     data: plData,
//     isFetched: isPlFetched,
//   } = useQuery({
//     queryKey: ["playlists"],
//     queryFn: getPlaylistsData,
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//   });

//   const {
//     isVidLoading,
//     data: vidData,
//     isFetching: isVidFetching,
//     isFetched: isVidFetched,
//   } = useQuery({
//     queryKey: ["videos"],
//     queryFn: getVideosData,
//     refetchOnWindowFocus: false,
//     refetchOnMount: false,
//   });

//   // useEffect related to the react-query data
//   useEffect(() => {
//     setPlaylistItems(plData?.items || []);
//   }, [plData]);

//   useEffect(() => {
//     setVideoItems(vidData?.items || []);
//   }, [vidData]);

//   // useEffect related to the Drag and Drop functionality
//   useEffect(() => {
//     if (playlistItems.length > 0) {
//       localStorage.setItem("playlists", JSON.stringify(playlistItems.map((item) => item.id)));

//     }
//   }, [playlistItems]);

//   useEffect(() => {
//     if (videoItems.length > 0) {
//       localStorage.setItem("videos", JSON.stringify(videoItems.map((item) => item.id)));
//     }
//   }, [videoItems]);

//   if ((isPlFetching || isVidFetching) && !isPlFetched) {
//     return (
//       <div className="mx-auto flex justify-center pt-2">
//         <Image src={spin} alt="skip 10 seconds" unoptimized width={24} height={24} className="animate-spin" />
//       </div>
//     );
//   }
//   if (isPlError) return <div>Error</div>;

//   function handleDragEnd(e, setter) {
//     const { active, over } = e;

//     if (active.id !== over.id) {
//       setter((items) => {
//         let activeIndex = items.findIndex((item) => item.id === active.id);
//         let overIndex = items.findIndex((item) => item.id === over.id);

//         return arrayMove(items, activeIndex, overIndex);
//       });
//     }
//   }

//   return (
//     <>
//       {!vidData?.items?.length && !plData?.items?.length && isPlFetched && isVidFetched && (
//         <div className="flex items-center flex-col gap-3 pt-10">
//           <h3 className=" text-neutral-400 text-lg font-semibold tracking-wide">No Items Added</h3>
//           <Image src={emptyBox} alt="skip 10 seconds" unoptimized width={52} height={52} />
//           <Link
//             href="/about"
//             className="bg-neutral-800 hover:bg-neutral-800/80 py-2 px-4 my-5 text-neutral-300 hover:text-neutral-300/80 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
//           >
//             Learn how it works
//           </Link>
//         </div>
//       )}
//       <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setPlaylistItems)}>
//         {playlistItems?.length > 0 && (
//           <SortableContext items={playlistItems}>
//             <>
//               {videoItems?.length > 0 && (
//                 <h2 className="md:pl-24 sm:pl-8 xl:pl-24 text-center md:text-left mt-6  text-zinc-300/90 font-semibold tracking-wide ">Playlists</h2>
//               )}
//               <div className="pl-3 sm:pl-7 pt-4 grid grid-cols-1 gap-y-2  xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
//                 {playlistItems?.map((playlist) => (
//                   <PlaylistItem key={playlist.id} id={playlist.id} title={playlist.snippet.title} thumbnail={playlist.snippet.thumbnails} type={"playlist"} />
//                 ))}
//               </div>
//             </>
//           </SortableContext>
//         )}
//       </DndContext>
//       <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, setVideoItems)}>
//         {videoItems?.length > 0 && (
//           <SortableContext items={videoItems}>
//             <>
//               <h1 className="md:pl-24 sm:pl-8 xl:pl-24  text-center md:text-left mt-6 text-zinc-300/90 font-semibold tracking-wide ">Videos</h1>
//               <div className="pl-3 sm:pl-7 pt-4 grid grid-cols-1 gap-y-2 xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
//                 {videoItems?.map((video) => (
//                   <PlaylistItem key={video.id} id={video.id} title={video.snippet.title} thumbnail={video.snippet.thumbnails} type={"video"} />
//                 ))}
//               </div>
//             </>
//           </SortableContext>
//         )}
//       </DndContext>
//     </>
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
import emptyBox from "@/assets/emptyBox.svg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AllPlaylists() {
  const [playlistItems, setPlaylistItems] = useState([]);
  const [videoItems, setVideoItems] = useState([]);

  const router = useRouter();

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
    if (plData?.items?.length) {
      for (let i of plData?.items) {
        router.prefetch(`/playlist/pl?list=${i.id}`);
      }
    }
  }, [plData]);

  useEffect(() => {
    setVideoItems(vidData?.items || []);
    if (vidData?.items?.length) {
      for (let i of vidData?.items) {
        router.prefetch(`/video/v?v=${i.id}`);
      }
    }
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
      {!vidData?.items?.length && !plData?.items?.length && isPlFetched && isVidFetched && (
        <div className="flex items-center flex-col gap-3 pt-10">
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
                <h2 className="md:pl-24 sm:pl-8 xl:pl-24 text-center md:text-left mt-3 2xl:mt-5  text-zinc-300/90 font-semibold tracking-wide ">Playlists</h2>
              )}
              <div className="pl-3 sm:pl-7 pt-4 grid grid-cols-1 gap-y-2  xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
                {playlistItems?.map((playlist) => (
                  <PlaylistItem
                    key={playlist.id}
                    id={playlist.id}
                    title={playlist.snippet.title}
                    thumbnail={playlist.snippet.thumbnails}
                    type={"playlist"}
                    setOnDelete={setPlaylistItems}
                  />
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
              <h1 className="md:pl-24 sm:pl-8 xl:pl-24 text-center md:text-left mt-2 2xl:mt-5 text-zinc-300/90 font-semibold tracking-wide ">Videos</h1>
              <div className="pl-3 sm:pl-7 pt-4 grid grid-cols-1 gap-y-2 xs:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 mx-4 lg:mx-6 2xl:mx-8 place-items-center">
                {videoItems?.map((video) => (
                  <PlaylistItem
                    key={video.id}
                    id={video.id}
                    title={video.snippet.title}
                    thumbnail={video.snippet.thumbnails}
                    type={"video"}
                    setOnDelete={setVideoItems}
                  />
                ))}
              </div>
            </>
          </SortableContext>
        )}
      </DndContext>
    </>
  );
}
