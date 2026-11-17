import { YouTubePlayer } from "react-youtube";
import { getSavedIds, safeGetItem, safeParse, safeSetItem } from "@/utils/safeLocalStorage";
import mapPlaylistPositions from "./mapPlaylistPositions";


const pendingSaves = new Map<string, symbol>();

function isThenable(v: unknown): v is PromiseLike<unknown> {
  return !!v && typeof (v as PromiseLike<unknown>).then === "function";
}

interface PlSnapshot {
  currentTime: unknown;
  duration: unknown;
  index: unknown;
  playlist: unknown;
}

function commit(item: string, playlistId: string, page: number, snap: PlSnapshot, indexOverride?: number): boolean {
  if (!Number.isInteger(page) || page < 1) return false;
  const currentTime = snap.currentTime;
  if (typeof currentTime !== "number" || !Number.isFinite(currentTime) || currentTime < 0) return false;
  const duration = typeof snap.duration === "number" ? snap.duration : 0;
  const rawIndex = indexOverride !== undefined ? indexOverride : snap.index;
  if (!Number.isInteger(rawIndex) || (rawIndex as number) < 0 || (rawIndex as number) > 199) return false;

  // if playlist is not in the list, return
  if (!getSavedIds("playlists").includes(playlistId)) return false;

  const currentPl = safeParse<Record<string, unknown>>(safeGetItem(item), {});
  if (typeof currentPl !== "object" || !currentPl || Array.isArray(currentPl)) return false;

  const plVideosParsed = safeParse<{ videosIds?: unknown }>(safeGetItem(`plVideos=${playlistId}`), {});
  const canonicalIds = Array.isArray(plVideosParsed.videosIds) ? plVideosParsed.videosIds : [];
  const totalVideos = canonicalIds.length;

  const actualPlaylist = Array.isArray(snap.playlist) && snap.playlist.every((id) => typeof id === "string") ? (snap.playlist as string[]) : null;

  // Map the raw player index through the actually loaded playlist into canonical order.
  const offset = (page - 1) * 200;
  const positions = actualPlaylist ? mapPlaylistPositions(canonicalIds.slice(offset, offset + 200), actualPlaylist) : null;
  let absoluteIndex: number;
  if (actualPlaylist) {
    const canonicalLocal = positions?.[rawIndex as number];
    if (canonicalLocal === undefined) return false;
    absoluteIndex = offset + canonicalLocal;
  } else {
    absoluteIndex = (rawIndex as number) + offset;
  }

  const remainingSeconds = duration - (currentTime as number);
  const watchedThresholdSeconds = duration > 0 ? Math.min(30, Math.max(5, duration * 0.01), duration * 0.1) : 0;
  const isVideoFinished = duration > 0 && totalVideos > 0 && remainingSeconds <= watchedThresholdSeconds;

  let nextAbsolute = absoluteIndex;

  if (isVideoFinished) {
    if (actualPlaylist && positions) {
      const nextLocal = positions[(rawIndex as number) + 1];
      if (nextLocal !== undefined) {
        const pos = offset + nextLocal;
        if (pos > absoluteIndex) nextAbsolute = pos;
      } else {
        // End of the loaded slice: first canonical slot of the next 200-item page, if it exists.
        const nextPageFirst = page * 200;
        if (nextPageFirst < totalVideos && nextPageFirst > absoluteIndex) nextAbsolute = nextPageFirst;
      }
    } else if (!actualPlaylist) {
      nextAbsolute = Math.min(absoluteIndex + 1, totalVideos - 1);
    }
  }

  const data = {
    ...currentPl,
    playlistId,
    currentItem: nextAbsolute % 200,
    initialTime: isVideoFinished ? 0 : (currentTime as number),
    currentPage: Math.floor(nextAbsolute / 200) + 1,
  };

  safeSetItem(item, JSON.stringify(data));
  return true;
}

export default function savePlaylistsProgress(videoPlayer: YouTubePlayer, playlistId: string, page: number, index?: number): Promise<void> {
  const item = `pl=${playlistId}`;

  if (!Number.isInteger(page) || page < 1) return Promise.resolve();
  if (index !== undefined && (!Number.isInteger(index) || index < 0)) return Promise.resolve();
  if (!getSavedIds("playlists").includes(playlistId)) return Promise.resolve(); // if playlist is not in the list, return
  if (!videoPlayer) return Promise.resolve();

  const token = Symbol();
  pendingSaves.set(item, token);

  try {
    const currentTime = videoPlayer?.getCurrentTime();
    const duration = videoPlayer?.getDuration();
    const currentIndex = index !== undefined ? index : videoPlayer?.getPlaylistIndex();
    const playlist = typeof videoPlayer?.getPlaylist === "function" ? videoPlayer.getPlaylist() : undefined;

    const needsAsync = isThenable(currentTime) || isThenable(duration) || isThenable(currentIndex) || isThenable(playlist);
    if (needsAsync) {
      return Promise.all([Promise.resolve(currentTime), Promise.resolve(duration), Promise.resolve(currentIndex), Promise.resolve(playlist)])
        .then(([t, d, i, pl]) => {
          if (pendingSaves.get(item) !== token) return;
          commit(item, playlistId, page, { currentTime: t, duration: d, index: i, playlist: pl }, index !== undefined ? index : undefined);
        })
        .catch(() => {})
        .finally(() => {
          if (pendingSaves.get(item) === token) pendingSaves.delete(item);
        });
    }

    if (pendingSaves.get(item) === token) {
      commit(item, playlistId, page, { currentTime, duration, index: currentIndex, playlist }, index !== undefined ? index : undefined);
      pendingSaves.delete(item);
    }
    return Promise.resolve();
  } catch {
    if (pendingSaves.get(item) === token) pendingSaves.delete(item);
    return Promise.resolve();
  }
}
