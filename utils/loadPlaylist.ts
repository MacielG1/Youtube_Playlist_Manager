import getVideosSlice from "./getVideosSlice";
import restorePlaylist from "./restorePlaylist";
import { YouTubePlayer } from "react-youtube";

export default async function loadPlaylist(Player: YouTubePlayer, videoIds: string[], page = 1, index = 0, timing?: { timeoutMs?: number; pollIntervalMs?: number }) {
  try {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Invalid playlist page");
    }
    if (!Number.isInteger(index) || index < 0) {
      throw new Error("Invalid playlist index");
    }

    const videosArr = getVideosSlice(videoIds, page);

    if (!videosArr || videosArr.length === 0) {
      throw new Error("No videos to load in playlist");
    }
    if (index >= videosArr.length) {
      throw new Error("Playlist index out of range");
    }

    return await restorePlaylist(Player, videosArr, index, 0, new AbortController().signal, timing?.timeoutMs ?? 15_000, timing?.pollIntervalMs ?? 100);
  } catch (error) {
    console.error("Error in loadPlaylist:", error);
    throw error;
  }
}
