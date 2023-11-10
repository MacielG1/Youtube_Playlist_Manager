import type { PlaylistItem, SavedItem, VideoItem } from "@/types";
import { toast } from "react-hot-toast";
import useIsExportable from "@/hooks/useIsExportable";
import { useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/utils/toastStyles";
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
    link.download = "YT-Export.json";
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
    <div className="mx-auto flex justify-center gap-2">
      <div className="grid max-w-sm items-center justify-center ">
        <label
          htmlFor="fileInput"
          className={`
           relative inline-flex items-center rounded-md border border-neutral-950 bg-neutral-200 px-[0.43rem]  py-[0.43rem] 
            text-base font-medium text-neutral-950 shadow-md ring-offset-background transition-colors 
          duration-300 hover:cursor-pointer hover:border hover:bg-white focus-visible:outline-none  dark:bg-neutral-800  dark:text-neutral-100 dark:hover:bg-neutral-950
          ${isExportable ? "max-w-[5.2rem]" : "w-[7.2rem] max-w-[7.2rem] pl-[1.9rem]"}`}
        >
          Import
          {/* Screen Reader */}
          <input type="file" id="fileInput" accept=".json" className="sr-only" onChange={importTimers} />
        </label>
      </div>
      {isExportable && (
        <button
          onClick={exportTimers}
          className=" h-10 max-w-[5.2rem] rounded-md  border border-neutral-950 bg-neutral-200 px-2 
           py-2  text-base font-medium text-neutral-950 shadow-md ring-offset-background 
           transition-colors duration-300 hover:cursor-pointer hover:border hover:bg-white
            focus-visible:outline-none  focus-visible:ring focus-visible:ring-neutral-700 focus-visible:ring-offset-2
           dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-900 "
        >
          Export
        </button>
      )}
    </div>
  );
}
