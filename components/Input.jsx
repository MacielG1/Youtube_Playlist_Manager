// "use client";
// import { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// let searchIcon = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 24 24"
//     width={18}
//     height={18}
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="11" cy="11" r="8" />
//     <line x1="21" y1="21" x2="16.65" y2="16.65" />
//   </svg>
// );

// export default function Input() {
//   const [playlistURL, setPlaylistURL] = useState("");

//   const queryClient = useQueryClient();

//   const { mutate, isLoading } = useMutation({
//     mutationFn: () => handleButtonClick,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["playlists"] });
//     },
//   });

//   function handleInputChange(e) {
//     // Add validation
//     setPlaylistURL(e.target.value);
//   }

//   const handleButtonClick = () => {
//     if (!playlistURL) return;
//     console.log("handleButtonClick");
//     let playlistID, videoId;
//     try {
//       let params = new URL(playlistURL).searchParams;
//       playlistID = params.get("list");
//       videoId = params.get("v");
//     } catch (error) {
//       return;
//     }

//     // Saving specific video data
//     if (videoId && !playlistID) {
//       let videoKey = "v=" + videoId;
//       if (localStorage.getItem(videoKey)) {
//         setPlaylistURL("");
//         return;
//       }
//       localStorage.setItem(videoKey, JSON.stringify({ initialTime: 0 }));

//       // Saving video to all videos Array
//       const allVideos = JSON.parse(localStorage.getItem("videos")) || [];
//       localStorage.setItem("videos", JSON.stringify([...allVideos, videoId]));
//     } else {
//       let playlistKey = "pl=" + playlistID;
//       if (localStorage.getItem(playlistKey)) {
//         setPlaylistURL("");
//         return;
//       }
//       localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));

//       // Saving playlist to all playlists Array
//       const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
//       localStorage.setItem("playlists", JSON.stringify([...allPlaylists, playlistID]));
//     }
//     mutate(playlistID);

//     setPlaylistURL("");
//   };

//   return (
//     <nav className="sticky top-0 z-50 my-2 ">
//       <div className="flex justify-center gap-2">
//         <input
//           type="text"
//           value={playlistURL}
//           onChange={handleInputChange}
//           placeholder="Enter a Playlist URL"
//           className="w-[30rem] min-w-[6rem] text-gray-300 text-lg px-2 rounded-md bg-neutral-900  focus:outline-none focus:bg-neutral-900/90 focus:ring-1 focus:ring-neutral-950 placeholder-neutral-500 focus:placeholder-neutral-600"
//         />
//         <button
//           disabled={isLoading}
//           onClick={handleButtonClick}
//           className={`flex items-center justify-center rounded-lg  border border-blue-800 bg-blue-700  hover:bg-blue-700/80 text-gray-100 px-4 py-2 hover:border-blue-950 hover:text-gray-200 transition duration-300`}
//         >
//           {searchIcon}
//         </button>
//       </div>

//       {isLoading && <div className="text-center text-gray-100">Loading...</div>}
//     </nav>
//   );
// }

"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

let searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={18}
    height={18}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Input() {
  const [playlistURL, setPlaylistURL] = useState("");

  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation({
    mutationFn: () => handleButtonClick,
  });

  function handleInputChange(e) {
    // Add validation
    setPlaylistURL(e.target.value);
  }

  const handleButtonClick = () => {
    if (!playlistURL) return;
    console.log("handleButtonClick");
    let playlistID, videoId;
    try {
      let params = new URL(playlistURL).searchParams;
      playlistID = params.get("list");
      videoId = params.get("v");
    } catch (error) {
      return;
    }

    // Saving specific video data
    if (videoId && !playlistID) {
      let videoKey = "v=" + videoId;
      if (localStorage.getItem(videoKey)) {
        setPlaylistURL("");
        return;
      }
      localStorage.setItem(videoKey, JSON.stringify({ initialTime: 0 }));

      // Saving video to all videos Array
      const allVideos = JSON.parse(localStorage.getItem("videos")) || [];
      localStorage.setItem("videos", JSON.stringify([...allVideos, videoId]));
    } else {
      // if it's a playlist

      let playlistKey = "pl=" + playlistID;
      if (localStorage.getItem(playlistKey)) {
        setPlaylistURL("");
        return;
      }
      localStorage.setItem(playlistKey, JSON.stringify({ currentItem: 0, initialTime: 0 }));

      // Saving playlist to all playlists Array
      const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
      localStorage.setItem("playlists", JSON.stringify([...allPlaylists, playlistID]));
    }
    if (playlistID) {
      mutate("playlist");
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    } else {
      mutate("video");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    }

    setPlaylistURL("");
  };

  return (
    <nav className="sticky top-0 z-20 mb-2 mt-3">
      <div className="flex justify-center gap-2 ">
        <input
          type="text"
          value={playlistURL}
          onChange={handleInputChange}
          placeholder="Enter a Playlist or Video URL"
          // className="w-[30rem] min-w-[6rem] text-neutral-400 text-lg px-2 border-neutral-950 border rounded-md bg-neutral-600  focus:outline-none focus:bg-neutral-800 focus:ring-1 focus:ring-neutral-950 placeholder-neutral-950 focus:placeholder-neutral-950"
          className=" w-[70vw] md:w-[30rem]   min-w[1rem] text-neutral-400 text-lg px-3 border-neutral-700 border-2 rounded-md bg-neutral-950  focus:outline-none focus:bg-neutral-900 placeholder-neutral-500 placeholder:text-base focus:placeholder-neutral-600 focus:border-neutral-500"
        />
        <button
          disabled={isLoading}
          onClick={handleButtonClick}
          className={`flex items-center justify-center rounded-lg  border border-blue-800 bg-blue-700  hover:bg-blue-700/80 text-gray-100 px-4 py-2 hover:border-blue-950 hover:text-gray-200 transition duration-300`}
        >
          {searchIcon}
        </button>
      </div>

      {isLoading && <div className="text-center text-gray-100">Loading...</div>}
    </nav>
  );
}
