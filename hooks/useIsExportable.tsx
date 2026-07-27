import { useSyncExternalStore } from "react";
import { safeParse } from "@/utils/safeLocalStorage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): boolean {
  const savedPlaylists = safeParse<string[]>(localStorage.getItem("playlists"), []);
  const savedVideos = safeParse<string[]>(localStorage.getItem("videos"), []);
  return savedPlaylists.length > 0 || savedVideos.length > 0;
}

function getServerSnapshot(): boolean {
  return false;
}

export default function useIsExportable() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
