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

    // if (isChannel) data.reverse(); // Reverse if it's a channel
    data = data.reverse();

    // Filter out videos that were manually removed
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
