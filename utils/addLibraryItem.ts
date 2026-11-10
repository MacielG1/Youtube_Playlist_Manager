import type { QueryClient } from "@tanstack/react-query";
import type { Items } from "@/types";
import { set } from "idb-keyval";
import getChannelId from "@/utils/createChannelPlaylist";
import getPlaylistsData from "@/utils/getPlaylistsData";
import getVideosData from "@/utils/getVideosData";
import fetchVideosIds from "@/utils/fetchVideosIds";
import { getSavedIds, safeGetItem, safeParse, writeStorageBatch } from "@/utils/safeLocalStorage";

export type AddItemType = "video" | "playlist" | "channel";
export type AddItemResult = { status: "added" | "duplicate"; type: AddItemType };

const inFlight = new Map<string, Promise<AddItemResult>>();

export default function addLibraryItem(queryClient: QueryClient, type: AddItemType, id: string): Promise<AddItemResult> {
  const key = `${type}:${id}`;
  const existing = inFlight.get(key);
  if (existing) return existing;
  const operation = doAdd(queryClient, type, id).finally(() => {
    inFlight.delete(key);
  });
  inFlight.set(key, operation);
  return operation;
}

async function doAdd(queryClient: QueryClient, type: AddItemType, id: string): Promise<AddItemResult> {
  // VIDEO
  if (type === "video") {
    // Double check both IndexedDB and localStorage array
    if (getSavedIds("videos").includes(id)) return { status: "duplicate", type };
    const videoKey = `v=${id}`;
    const data = await getVideosData(id);
    if (!data?.items?.length) throw new Error("Video is Invalid or Private!");
    const existing = safeParse<Record<string, unknown> | null>(safeGetItem(videoKey), null);
    const allVideos = getSavedIds("videos");
    // Only block if it's in both storage locations
    if (allVideos.includes(id)) return { status: "duplicate", type };
    writeStorageBatch([
      [videoKey, JSON.stringify(existing ?? { initialTime: 0 })],
      ["videos", JSON.stringify([...allVideos, id])],
    ]);
    await queryClient.cancelQueries({ queryKey: ["videos"] });
    // Updating the query data with the new playlist
    queryClient.setQueryData<Items>(["videos"], (prev) => {
      if (!prev || !prev?.items?.length) return data;
      if (prev.items.some((item) => item.id === id)) return prev;
      return { ...data, items: [...prev.items, ...data.items] };
    });
    return { status: "added", type };
  }

  // PLAYLIST or CHANNEL ID
  let playlistId = id;
  // Channel uploads playlists (UU...) need reverse for oldest-first.
  let isChannelPlaylist = id.startsWith("UU");
  if (type === "channel") {
    if (id.startsWith("UC")) {
      playlistId = "UU" + id.slice(2);
    } else {
      const channelId = await getChannelId(id);
      if (!channelId) throw new Error("Invalid Channel!");
      playlistId = channelId;
    }
    isChannelPlaylist = true;
  }

  // Double check both IndexedDB and localStorage array
  if (getSavedIds("playlists").includes(playlistId)) return { status: "duplicate", type };

  const [playlistData, videosData] = await Promise.all([getPlaylistsData(playlistId), fetchVideosIds(playlistId, undefined, isChannelPlaylist)]);

  if (!playlistData?.items?.length) throw new Error("Playlist is Invalid or Private!");

  const playlistKey = `pl=${playlistId}`;
  await set(playlistKey, videosData).catch(() => {});

  const existing = safeParse<Record<string, unknown> | null>(safeGetItem(playlistKey), null);
  const allPlaylists = getSavedIds("playlists");
  // Only block if it's in both storage locations
  if (allPlaylists.includes(playlistId)) return { status: "duplicate", type };

  writeStorageBatch([
    [
      playlistKey,
      JSON.stringify(existing ?? { currentItem: 0, initialTime: 0, ...(isChannelPlaylist ? { isChannel: true } : {}) }),
    ],
    ["playlists", JSON.stringify([...allPlaylists, playlistId])],
  ]);

  await queryClient.cancelQueries({ queryKey: ["playlists"] });
  // Updating the query data with the new playlist
  queryClient.setQueryData<Items>(["playlists"], (prev) => {
    // if no playlists saved, return the new one
    if (!prev || !prev?.items?.length) return playlistData;
    if (prev.items.some((item) => item.id === playlistId)) return prev;
    const newItems = type === "channel" ? [playlistData.items[0]] : playlistData.items;
    return { ...playlistData, items: [...prev.items, ...newItems] };
  });
  return { status: "added", type };
}
