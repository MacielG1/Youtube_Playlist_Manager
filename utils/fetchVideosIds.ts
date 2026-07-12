import { Playlist } from "@/types";
import { get } from "idb-keyval";
import { RefObject } from "react";

export default async function fetchVideosIds(playlistId: string, videosIdsRef?: RefObject<string[]>, isChannel?: boolean) {
  try {
    const removedVideos = (await get(`plRemoved=${playlistId}`)) || [];

    const res = await fetch(`/api/fetchVideosIds/${playlistId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!res.ok) {
      console.error("Error", res.statusText);
      const savedVideos = await get(`pl=${playlistId}`);
      return savedVideos || [];
    }

    let data = await res.json();

    // YouTube channel uploads return newest-first natively.
    // Reverse so oldest upload is first (chronological order).
    // Regular playlists keep native position order.
    if (isChannel) data = data.reverse();

    const newVideos = data.filter((video: Playlist) => !removedVideos.includes(video.id));

    if (videosIdsRef) {
      videosIdsRef.current = newVideos.map((item: Playlist) => item.id);
    }

    const allVideosIds = newVideos.map((item: Playlist) => item.id);

    localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ videosIds: allVideosIds, updatedTime: Date.now() }));

    return newVideos;
  } catch (error) {
    console.error("Error fetching data in fetchVideosIds:", error);
    const savedVideos = await get(`pl=${playlistId}`);
    return savedVideos || [];
  }
}
