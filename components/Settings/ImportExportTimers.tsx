import type { PlaylistItem, SavedItem, VideoItem } from "@/types";
import { toast } from "react-hot-toast";
import useIsExportable from "@/hooks/useIsExportable";
import { useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/utils/toastStyles";
import { getSavedIds, safeGetItem, safeParse, writeStorageBatch } from "@/utils/safeLocalStorage";
import { mergeTimerBackup, normalizePlaylistData, normalizeVideoData, parseTimerBackup } from "@/utils/timerBackup";

// import { set } from "idb-keyval";
// import getVideoData from "@/utils/getVideosData";
// import fetchVideosIds from "@/utils/fetchVideosIds";

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

export default function ImportExportTimers({ setModalOpen }: { setModalOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const isExportable = useIsExportable();
  const queryClient = useQueryClient();

  // funciton that export the timers to a json file and create a download link with React
  function exportTimers() {
    // object all the keys from local sotrage that starts with pl
    const savedPlaylists = getSavedIds("playlists");
    const savedVideos = getSavedIds("videos");

    const allPlaylistData: SavedItem[] = [];
    const allVideoData: SavedItem[] = [];

    savedPlaylists.forEach((id) => {
      const key = `pl=${id}`;
      const data = normalizePlaylistData(safeParse<PlaylistItem | null>(safeGetItem(key), null), id);
      if (data !== null) {
        allPlaylistData.push({ key, data });
      }
    });

    savedVideos.forEach((id) => {
      const key = `v=${id}`;
      const data = normalizeVideoData(safeParse<VideoItem | null>(safeGetItem(key), null), id);
      if (data !== null) {
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
    const objectUrl = URL.createObjectURL(fileToSave);
    link.href = objectUrl;

    const date = new Date().toLocaleDateString().replaceAll("/", "-");
    link.download = `YT-Export-${date}.json`;
    toast.success("Exporting", toastSuccess);

    link.click(); // Simulate a click
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    setModalOpen(false);
  }

  function importTimers(evt: React.ChangeEvent<HTMLInputElement>) {
    const input = evt.target;
    const files = input.files;

    if (!files || files.length === 0) return;

    const file = files[0];
    const isJsonFile = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
    if (!isJsonFile || file.size > MAX_IMPORT_BYTES) {
      toast.error("Invalid File", toastError);
      input.value = "";
      return;
    }

    const fileReader = new FileReader();

    fileReader.onerror = () => {
      toast.error("Invalid File", toastError);
      input.value = "";
    };

    fileReader.onload = async (e: ProgressEvent<FileReader>) => {
      let jsonData;

      try {
        const fileContent = e.target!.result as string;
        jsonData = JSON.parse(fileContent);
      } catch {
        toast.error("Invalid File", toastError);
        return;
      }

      const parsed = parseTimerBackup(jsonData);
      if (!parsed.ok) {
        toast.error("Invalid File", toastError);
        return;
      }

      // Getting the Current Saved Playlists and Videos
      const currentSavedPlaylists = getSavedIds("playlists");
      const currentSavedVideos = getSavedIds("videos");

      // Merging Playlists without duplicates
      // Merging Videos without duplicates
      const merged = mergeTimerBackup({ playlists: currentSavedPlaylists, videos: currentSavedVideos }, parsed.value);

      try {
        // Merging Playlist and Video Data
        writeStorageBatch([
          ["playlists", JSON.stringify(merged.playlists)],
          ["videos", JSON.stringify(merged.videos)],
          ...merged.entries,
        ]);
      } catch (e) {
        console.error("localStorage quota exceeded during import:", e);
        toast.error(e instanceof Error ? e.message : "Storage write failed — import aborted", toastError);
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });

      // for (let i of uniqueNewPlaylists) {
      //   let data = await fetchVideosIds(i);
      //   let playlistKey = `pl=${i}`;
      //   await set(playlistKey, data);
      // }

      setModalOpen(false);
      toast.success("Imported", toastSuccess);
    };
    fileReader.readAsText(file);
    input.value = "";
  }

  return (
    <div className="flex w-full gap-2">
      <label
        htmlFor="fileInput"
        className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-200 focus-within:ring-2 focus-within:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-700/50"
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
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300/80"
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
