import { Playlist } from "@/types";
import getPlaylistSize from "./getPlaylistSize";
import { get } from "idb-keyval";

export default async function fetchVideosIds(playlistId: string, videosIdsRef?: React.MutableRefObject<string[]>, isChannel?: boolean) {
  const currentPlaylistSize = await getPlaylistSize(playlistId);
  let savedVideos = await get(`pl=${playlistId}`);

  if (savedVideos && savedVideos.length === currentPlaylistSize) {
    return savedVideos;
  }

  try {
    const res = await fetch(`/api/fetchVideosIds/${playlistId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      // body: JSON.stringify({ existingVideoIds }),
    });

    if (!res.ok) {
      console.log("Error", res.statusText);
      return console.log("Error", res.statusText);
    }

    let data = await res.json();

    const allVideosIds = data.map((item: Playlist) => item.id);

    console.log(allVideosIds.length, "videos fetched");

    if (isChannel) {
      allVideosIds.reverse();
      data.reverse(); // Reverse the data array
    }

    if (videosIdsRef) {
      videosIdsRef.current = allVideosIds;
    }

    localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ videosIds: allVideosIds, updatedTime: Date.now() }));

    return data;
  } catch (error) {
    console.error("Error fetching data in FetchVideosIds:", error);
    return null;
  }
}
