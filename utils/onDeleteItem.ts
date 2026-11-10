import { getSavedIds, safeGetItem, safeParse, writeStorageBatch } from "@/utils/safeLocalStorage";

export default function onDeleteItems(itemId: string, type: "playlists" | "videos") {
  const entries: Array<readonly [string, string | null]> = [];

  if (type === "playlists") {
    entries.push([`pl=${itemId}`, null], [`plVideos=${itemId}`, null]);

    const customThumbnails = safeParse<Record<string, unknown>>(safeGetItem("customPlaylistThumbnails"), {});
    if (Object.hasOwn(customThumbnails, itemId)) {
      delete customThumbnails[itemId];
      entries.push(["customPlaylistThumbnails", JSON.stringify(customThumbnails)]);
    }
  } else {
    entries.push([`v=${itemId}`, null]);
  }

  // remove playlist from playlists array
  const allItems = getSavedIds(type);
  const newItems = allItems.filter((i: string) => i !== itemId);

  entries.push([type, JSON.stringify(newItems)]);

  writeStorageBatch(entries);
}
