import { useSyncExternalStore } from "react";
import { getSavedIds } from "@/utils/safeLocalStorage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("local-storage", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("local-storage", callback);
  };
}

function getSnapshot(): boolean {
  return getSavedIds("playlists").length > 0 || getSavedIds("videos").length > 0;
}

function getServerSnapshot(): boolean {
  return false;
}

export default function useIsExportable() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
