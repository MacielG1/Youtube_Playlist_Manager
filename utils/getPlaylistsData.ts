import type { Playlist, Thumbnails } from "@/types";
import { fetchMetadata } from "@/utils/fetchMetadata";
import { getSavedIds, safeGetItem, safeParse } from "@/utils/safeLocalStorage";

export default async function getPlaylistsData(newPlaylistId?: string) {
  const playlistsIds = newPlaylistId
    ? newPlaylistId
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : getSavedIds("playlists");

  if (playlistsIds.length === 0) {
    return { items: [] };
  }

  try {
    const items = await fetchMetadata<Playlist>(playlistsIds, {
      endpoint: "/api/playlistsData",
      bodyKey: "playlistsIds",
    });

    // Apply custom thumbnails if set
    const customThumbnails = safeParse<Record<string, Thumbnails>>(safeGetItem("customPlaylistThumbnails"), {});
    const itemsWithThumbnails =
      Object.keys(customThumbnails).length > 0
        ? items.map((item) => (Object.hasOwn(customThumbnails, item.id) ? { ...item, thumbnails: customThumbnails[item.id] as Thumbnails } : item))
        : items;

    return { items: itemsWithThumbnails };
  } catch (error) {
    console.log("Error in getPlaylistsData", error);
    throw error;
  }
}
