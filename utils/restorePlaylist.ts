import type { YouTubePlayer } from "react-youtube";
import mapPlaylistPositions from "./mapPlaylistPositions";

export type PlaylistRestoreResult = { videoId: string; index: number; canonicalIndex: number; startSeconds: number };

const getActualVideoId = async (player: YouTubePlayer): Promise<string> => {
  if (typeof player.getVideoData === "function") {
    const data = await player.getVideoData();
    return typeof data?.video_id === "string" ? data.video_id : "";
  }
  if (typeof player.getVideoUrl === "function") {
    const url = await player.getVideoUrl();
    if (typeof url !== "string" || !url) return "";
    try {
      return new URL(url).searchParams.get("v") ?? "";
    } catch {
      return "";
    }
  }
  return "";
};

export default function restorePlaylist(player: YouTubePlayer, ids: string[], index: number, startSeconds: number, signal: AbortSignal, timeoutMs = 15_000, pollIntervalMs = 100): Promise<PlaylistRestoreResult> {
  return new Promise((resolve, reject) => {
    if (!ids.length || !Number.isInteger(index) || index < 0 || index >= ids.length || !Number.isFinite(startSeconds) || startSeconds < 0) {
      reject(new Error("Invalid playlist restore position"));
      return;
    }
    const canReadVideoId = typeof player.getVideoData === "function" || typeof player.getVideoUrl === "function";
    let settled = false;
    let loaded = false;
    let seekRequested = false;
    let correctedId: string | null = null;
    let poll: ReturnType<typeof setTimeout> | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    const finish = (error?: Error, result?: PlaylistRestoreResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(poll);
      clearTimeout(deadline);
      signal.removeEventListener("abort", onAbort);
      if (error) reject(error);
      else resolve(result as PlaylistRestoreResult);
    };
    const onAbort = () => finish(new DOMException("Playlist restore cancelled", "AbortError"));

    const pickTarget = (actualIds: string[]) => {
      const positions = mapPlaylistPositions(ids, actualIds);
      if (!positions) return null;
      const requestedPos = positions.indexOf(index);
      if (requestedPos >= 0) return { id: ids[index], actualIndex: requestedPos, canonicalIndex: index, isRequested: true };
      const after = positions.findIndex((p) => p > index);
      if (after >= 0) return { id: actualIds[after], actualIndex: after, canonicalIndex: positions[after], isRequested: false };
      const last = actualIds.length - 1;
      return { id: actualIds[last], actualIndex: last, canonicalIndex: positions[last], isRequested: false };
    };

    const check = async () => {
      try {
        const iframe = await player.getIframe();
        if (settled) return;
        if (iframe?.isConnected) {
          if (!loaded) {
            loaded = true;
            // A nonzero playlist startSeconds also affects later videos in the YouTube player.
            await player.loadPlaylist(ids, index, 0);
            if (settled) return;
          }
          const [actualIndex, actualIds, actualVideoId] = await Promise.all([player.getPlaylistIndex(), player.getPlaylist(), getActualVideoId(player)]);
          if (settled) return;
          if (!Array.isArray(actualIds) || actualIds.length === 0) {
            poll = setTimeout(() => { void check(); }, pollIntervalMs);
            return;
          }
          const chosen = pickTarget(actualIds);
          if (!chosen) {
            // May still be the previous playlist before loadPlaylist is reflected; wait for a matching subset.
            poll = setTimeout(() => { void check(); }, pollIntervalMs);
            return;
          }
          // Wrappers that cannot report the playing ID are confirmed by playlist index alone.
          const atTarget = actualIndex === chosen.actualIndex && (!canReadVideoId || actualVideoId === chosen.id);
          if (!atTarget && correctedId !== chosen.id) {
            correctedId = chosen.id;
            await player.playVideoAt(chosen.actualIndex);
            if (settled) return;
            poll = setTimeout(() => { void check(); }, pollIntervalMs);
            return;
          }
          if (!atTarget) {
            poll = setTimeout(() => { void check(); }, pollIntervalMs);
            return;
          }
          const resumeSeconds = chosen.isRequested ? startSeconds : 0;
          if (resumeSeconds > 0) {
            if (!seekRequested) {
              seekRequested = true;
              await player.seekTo(resumeSeconds, true);
              if (settled) return;
            }
            const currentTime = await player.getCurrentTime();
            if (settled) return;
            if (typeof currentTime !== "number" || !Number.isFinite(currentTime) || Math.abs(currentTime - resumeSeconds) > 2) {
              poll = setTimeout(() => { void check(); }, pollIntervalMs);
              return;
            }
          }
          finish(undefined, { videoId: chosen.id, index: chosen.actualIndex, canonicalIndex: chosen.canonicalIndex, startSeconds: resumeSeconds });
          return;
        }
        poll = setTimeout(() => { void check(); }, pollIntervalMs);
      } catch (error) {
        finish(error instanceof Error ? error : new Error("Playlist restore failed"));
      }
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    signal.addEventListener("abort", onAbort, { once: true });
    deadline = setTimeout(() => finish(new Error("Playlist restore timed out")), timeoutMs);
    // Raw onReady can fire before the iframe API finishes attaching its internals.
    poll = setTimeout(() => { void check(); }, 0);
  });
}
