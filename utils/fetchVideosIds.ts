import { Playlist } from "@/types";
import { get } from "idb-keyval";

export default async function fetchVideosIds(playlistId: string, videosIdsRef?: React.MutableRefObject<string[]>, isChannel?: boolean) {
  try {
    const [savedVideos = [], removedVideos = []] = await Promise.all([get(`pl=${playlistId}`), get(`plRemoved=${playlistId}`)]);

    const res = await fetch(`/api/fetchVideosIds/${playlistId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!res.ok) {
      console.error("Error", res.statusText);
      return savedVideos;
    }

    let data = await res.json();

    if (isChannel) data.reverse(); // Reverse if it's a channel

    const newVideos = data.filter((video: Playlist) => {
      return !removedVideos.includes(video.id) && !savedVideos.some((savedVideo: Playlist) => savedVideo.id === video.id);
    });

    if (videosIdsRef) {
      videosIdsRef.current = data.map((item: Playlist) => item.id);
    }

    const allVideos = [...newVideos, ...savedVideos];
    const allVideosIds = allVideos.map((item: Playlist) => item.id);

    localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ videosIds: allVideosIds, updatedTime: Date.now() }));

    return allVideos;
  } catch (error) {
    console.error("Error fetching data in fetchVideosIds:", error);
    return (await get(`pl=${playlistId}`)) || [];
  }
}
