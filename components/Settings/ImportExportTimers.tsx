import type { Playlist, PlaylistItem, SavedItem, VideoItem } from "@/types";
import { toast } from "react-hot-toast";
import useIsExportable from "@/hooks/useIsExportable";
import { useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/utils/toastStyles";
import getVideosData from "@/utils/getVideosData";
import { set } from "idb-keyval";

// import { set } from "idb-keyval";
// import getVideoData from "@/utils/getVideosData";
// import fetchVideosIds from "@/utils/fetchVideosIds";

export default function ImportExportTimers({ setModalOpen }: { setModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const isExportable = useIsExportable();
  const queryClient = useQueryClient();

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
    const fileToSave = new Blob(
      [
        JSON.stringify({
          savedPlaylists,
          savedVideos,
          allPlaylistData,
          allVideoData,
        }),
      ],
      {
        type: "application/json",
      },
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(fileToSave);

    const date = new Date().toLocaleDateString().replaceAll("/", "-");
    link.download = `YT-Export-${date}.json`;
    toast.success("Exporting", toastSuccess);

    link.click(); // Simulate a click
    setModalOpen(false);
  }

  function importTimers(evt: React.ChangeEvent<HTMLInputElement>) {
    const files = evt.target.files;

    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== "application/json") return;

    const fileReader = new FileReader();

    fileReader.onload = async (e: ProgressEvent<FileReader>) => {
      const fileContent = e.target!.result as string;
      const jsonData = JSON.parse(fileContent);

      if (!jsonData.savedPlaylists || !jsonData.savedVideos) {
        toast.error("Invalid File", toastError);
      }

      // Getting the Current Saved Playlists and Videos
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
      currentSavedPlaylists.forEach((playlist: string) => (existingPlaylistIds[playlist] = true));
      const uniqueNewPlaylists = jsonData.savedPlaylists.filter((playlist: string) => !existingPlaylistIds[playlist]);
      const mergedPlaylists = [...currentSavedPlaylists, ...uniqueNewPlaylists];

      // Merging Videos without duplicates
      const existingVideoIds: { [id: string]: boolean } = {};
      currentSavedVideos.forEach((video: string) => (existingVideoIds[video] = true));

      const uniqueNewVideos = jsonData.savedVideos.filter((video: string) => !existingVideoIds[video]);
      const mergedVideos = [...currentSavedVideos, ...uniqueNewVideos];

      localStorage.setItem("playlists", JSON.stringify(mergedPlaylists));
      localStorage.setItem("videos", JSON.stringify(mergedVideos));

      // Merging Playlist and Video Data
      const mergedAllPlaylistData = [...currentAllPlaylistData, ...jsonData.allPlaylistData];
      const mergedAllVideoData = [...currentAllVideoData, ...jsonData.allVideoData];

      mergedAllPlaylistData.forEach((playlist) => {
        localStorage.setItem(playlist.key, JSON.stringify(playlist.data));
      });

      mergedAllVideoData.forEach((video) => {
        localStorage.setItem(video.key, JSON.stringify(video.data));
      });

      queryClient.refetchQueries({ queryKey: ["playlists"] });
      queryClient.refetchQueries({ queryKey: ["videos"] });

      // for (let i of uniqueNewPlaylists) {
      //   let data = await fetchVideosIds(i);
      //   let playlistKey = `pl=${i}`;
      //   await set(playlistKey, data);
      // }

      setModalOpen(false);
    };
    fileReader.readAsText(file);
  }

  return (
    <div className="flex w-full gap-2">
      <label
        htmlFor="fileInput"
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100 focus-within:ring-2 focus-within:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700/50 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Import
        <input type="file" id="fileInput" accept=".json" className="sr-only" onChange={importTimers} />
      </label>

      {isExportable && (
        <button
          onClick={exportTimers}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700/50 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      )}
    </div>
  );
}
