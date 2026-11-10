import { YouTubePlayer } from "react-youtube";
import { getSavedIds, safeGetItem, safeParse, safeSetItem } from "@/utils/safeLocalStorage";

export default async function savePlaylistsProgress(videoPlayer: YouTubePlayer, playlistId: string, page: number, index?: number) {
  try {
    if (!Number.isInteger(page) || page < 1) return;
    if (index !== undefined && (!Number.isInteger(index) || index < 0)) return;

    if (!getSavedIds("playlists").includes(playlistId)) return; // if playlist is not in the list, return

    const item = `pl=${playlistId}`;

    if (!videoPlayer) return;

    const currentTime = (await videoPlayer?.getCurrentTime()) as number;
    if (typeof currentTime !== "number" || !Number.isFinite(currentTime) || currentTime < 0) return;
    const duration = (await videoPlayer?.getDuration()) as number;
    const currentIndex = index !== undefined ? index : ((await videoPlayer?.getPlaylistIndex()) as number);
    if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex > 199) return;

    if (!getSavedIds("playlists").includes(playlistId)) return;

    const currentPl = safeParse<{ currentItem?: number; currentPage?: number; initialTime?: number; isChannel?: boolean } | null>(safeGetItem(item), null);
    if (!currentPl || typeof currentPl !== "object" || Array.isArray(currentPl)) return;

    const plVideosParsed = safeParse<{ videosIds?: unknown }>(safeGetItem(`plVideos=${playlistId}`), {});
    const totalVideos = Array.isArray(plVideosParsed.videosIds) ? plVideosParsed.videosIds.length : 0;

    const remainingSeconds = duration - currentTime;
    const watchedThresholdSeconds = duration > 0 ? Math.min(30, Math.max(5, duration * 0.01), duration * 0.1) : 0;
    const isVideoFinished = duration > 0 && remainingSeconds <= watchedThresholdSeconds;

    let nextIndex = currentIndex;
    let nextPage = page;

    if (isVideoFinished) {
      const currentAbsoluteIndex = currentIndex + (page - 1) * 200;
      const lastAbsoluteIndex = totalVideos > 0 ? totalVideos - 1 : Number.MAX_SAFE_INTEGER;
      const nextAbsoluteIndex = Math.min(currentAbsoluteIndex + 1, lastAbsoluteIndex);

      if (nextAbsoluteIndex !== currentAbsoluteIndex) {
        nextPage = Math.floor(nextAbsoluteIndex / 200) + 1;
        nextIndex = nextAbsoluteIndex % 200;
      }
    }

    const data = {
      ...currentPl,
      playlistId,
      currentItem: isVideoFinished ? nextIndex : currentIndex,
      initialTime: isVideoFinished ? 0 : currentTime,
      currentPage: nextPage,
    };

    safeSetItem(item, JSON.stringify(data));
  } catch {
    return;
  }
}
