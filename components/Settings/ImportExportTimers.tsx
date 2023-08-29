import { Playlist, PlaylistItem, SavedItem, VideoItem } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ToastOptions, toast } from "react-hot-toast";

const toastSuccess: ToastOptions = {
  position: "top-center",
  style: {
    border: "1px solid #14ff76",
    padding: "12px",
    color: "#b5b5b5",
    backgroundColor: "#000",
  },
  iconTheme: {
    primary: "#14ff76",
    secondary: "#000",
  },
};

export default function ImportExportTimers({ setModalOpen }: { setModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [isExportable, setIsExportable] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const savedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    const savedVideos = JSON.parse(localStorage.getItem("videos") || "[]");

    if (savedPlaylists.length > 0 || savedVideos.length > 0) {
      setIsExportable(true);
    }

    return () => {
      setIsExportable(false);
    };
  }, []);

  // funciton that export the timers to a json file and create a download link with React
  function exportTimers() {
    // object all the keys from local sotrage that starts with pl
    const savedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    const savedVideos = JSON.parse(localStorage.getItem("videos") || "[]");

    const allKeys = Object.keys(localStorage);

    const allPlaylistData: SavedItem[] = [];
    const allVideoData: SavedItem[] = [];

    allKeys.forEach((key) => {
      if (key.startsWith("pl=")) {
        const data: PlaylistItem = JSON.parse(localStorage.getItem(key) || "{}");
        allPlaylistData.push({ key, data });
      } else if (key.startsWith("v=")) {
        const data: VideoItem = JSON.parse(localStorage.getItem(key) || "{}");
        allVideoData.push({ key, data });
      }
    });

    // Create a blob of the data
    const fileToSave = new Blob([JSON.stringify({ savedPlaylists, savedVideos, allPlaylistData, allVideoData })], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(fileToSave);
    link.download = "YT-Export.json";
    toast.success("Exporting", toastSuccess);

    link.click(); // Simulate a click on the anchor to start the download
  }

  function importTimers(evt: React.ChangeEvent<HTMLInputElement>) {
    const files = evt.target.files;

    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "application/json") return;

    const fileReader = new FileReader();

    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target!.result as string;
      const jsonData = JSON.parse(fileContent);

      if (!jsonData.savedPlaylists || !jsonData.savedVideos) {
        console.log("Invalid file format");
      }

      const currentSavedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
      const currentSavedVideos = JSON.parse(localStorage.getItem("videos") || "[]");

      const allKeys = Object.keys(localStorage);
      const currentAllPlaylistData: SavedItem[] = [];
      const currentAllVideoData: SavedItem[] = [];

      allKeys.forEach((key) => {
        if (key.startsWith("pl=")) {
          const data: PlaylistItem = JSON.parse(localStorage.getItem(key) || "{}");
          currentAllPlaylistData.push({ key, data });
        } else if (key.startsWith("v=")) {
          const data: VideoItem = JSON.parse(localStorage.getItem(key) || "{}");
          currentAllVideoData.push({ key, data });
        }
      });

      // Merging Playlists without duplicates
      const existingPlaylistIds: { [id: string]: boolean } = {};
      currentSavedPlaylists.forEach((playlist: Playlist) => (existingPlaylistIds[playlist.id] = true));
      const uniqueNewPlaylists = jsonData.savedPlaylists.filter((playlist: Playlist) => !existingPlaylistIds[playlist.id]);
      const mergedPlaylists = [...currentSavedPlaylists, ...uniqueNewPlaylists];

      // Merging Videos without duplicates
      const existingVideoIds: { [id: string]: boolean } = {};
      currentSavedVideos.forEach((video: Playlist) => (existingVideoIds[video.id] = true));
      const uniqueNewVideos = jsonData.savedVideos.filter((video: Playlist) => !existingVideoIds[video.id]);
      const mergedVideos = [...currentSavedVideos, ...uniqueNewVideos];

      const mergedAllPlaylistData = [...currentAllPlaylistData, ...jsonData.allPlaylistData];
      const mergedAllVideoData = [...currentAllVideoData, ...jsonData.allVideoData];

      localStorage.setItem("playlists", JSON.stringify(mergedPlaylists));
      localStorage.setItem("videos", JSON.stringify(mergedVideos));

      mergedAllPlaylistData.forEach((playlist) => {
        const key = Object.keys(playlist)[0];

        localStorage.setItem(key, JSON.stringify(playlist[key]));
      });

      mergedAllVideoData.forEach((video) => {
        const key = Object.keys(video)[0];

        localStorage.setItem(key, JSON.stringify(video[key]));
      });

      queryClient.refetchQueries(["playlists"]);
      queryClient.refetchQueries(["videos"]);
    };
    fileReader.readAsText(file);
  }

  return (
    <div className="flex justify-center gap-2 py-2 mx-auto">
      <div className="grid  max-w-sm items-center justify-center ">
        <label
          htmlFor="fileInput"
          className={`text-base hover:cursor-cell relative inline-flex items-center px-2 py-2 
           text-white bg-neutral-800 hover:bg-neutral-950 hover:border border border-neutral-950 
           duration-300 rounded-md  font-medium ring-offset-background transition-colors focus-visible:outline-none 
           focus-visible:border focus-visible:border-neutral-400 ${isExportable ? "max-w-[5.2rem]" : " pl-6 w-[6.5rem] max-w-[7rem]"}`}
        >
          Import
          {/* Screen Reader */}
          <input type="file" id="fileInput" accept=".json" className="sr-only" onChange={importTimers} />
        </label>
      </div>
      {isExportable && (
        <button
          onClick={exportTimers}
          className=" max-w-[5.2rem] hover:cursor-pointer px-2 py-2 h-10 bg-neutral-800 text-white hover:bg-neutral-950 hover:border border border-neutral-950 duration-300 rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:border focus-visible:border-neutral-400 "
        >
          Export
        </button>
      )}
    </div>
  );
}
