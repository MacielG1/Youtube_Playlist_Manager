import { Playlist } from "@/types";
import { get } from "idb-keyval";
import { RefObject } from "react";
import { safeSetItem } from "@/utils/safeLocalStorage";

export default async function fetchVideosIds(playlistId: string, videosIdsRef?: RefObject<string[]>, isChannel?: boolean, options?: { allowCacheFallback?: boolean }) {
  const removedRaw = await get(`plRemoved=${playlistId}`).catch(() => []);
  const removedVideos = new Set<string>(Array.isArray(removedRaw) ? removedRaw : []);

  try {
    const res = await fetch(`/api/fetchVideosIds/${playlistId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!res.ok) {
      const error = new Error(res.statusText || "Failed to fetch videos");
      (error as Error & { status?: number }).status = res.status;
      throw error;
    }

    let data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid response");
    }
    for (const video of data) {
      if (!video || typeof video.id !== "string" || typeof video.title !== "string") {
        throw new Error("Invalid response");
      }
    }

    // YouTube channel uploads return newest-first natively.
    // Reverse so oldest upload is first (chronological order).
    // Regular playlists keep native position order.
    if (isChannel) data = data.reverse();

    const newVideos = data.filter((video: Playlist) => video && !removedVideos.has(video.id));

    if (videosIdsRef) {
      videosIdsRef.current = newVideos.map((item: Playlist) => item.id);
    }

    const allVideosIds = newVideos.map((item: Playlist) => item.id);

    safeSetItem(`plVideos=${playlistId}`, JSON.stringify({ videosIds: allVideosIds, updatedTime: Date.now() }));

    return newVideos;
  } catch (error) {
    console.error("Error fetching data in fetchVideosIds:", error);
    if (options?.allowCacheFallback === false) {
      throw error;
    }
    const savedVideos = await get(`pl=${playlistId}`).catch(() => undefined);
    if (Array.isArray(savedVideos)) {
      const filtered = savedVideos.filter(
        (video: Playlist) => video && typeof video.id === "string" && typeof video.title === "string" && !removedVideos.has(video.id),
      );
      if (videosIdsRef) {
        videosIdsRef.current = filtered.map((item: Playlist) => item.id);
      }
      return filtered;
    }
    throw error;
  }
}
