import { safeParse, safeSetItem } from "@/utils/safeLocalStorage";

export default function onDeleteItems(itemId: string, type: "playlists" | "videos") {
  if (type === "playlists") {
    localStorage.removeItem(`pl=${itemId}`);
    localStorage.removeItem(`plVideos=${itemId}`);
  } else {
    localStorage.removeItem(`v=${itemId}`);
  }

  // remove playlist from playlists array
  const allPlaylists = safeParse<string[]>(localStorage.getItem(type), []);
  const newPlaylists = allPlaylists.filter((i: string) => i !== itemId);

  safeSetItem(type, JSON.stringify(newPlaylists));
}
