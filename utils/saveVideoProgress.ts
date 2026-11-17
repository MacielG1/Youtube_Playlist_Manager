import { YouTubePlayer } from "react-youtube";
import { getSavedIds, safeGetItem, safeParse, safeSetItem } from "@/utils/safeLocalStorage";

const pendingSaves = new Map<string, symbol>();

function isThenable(v: unknown): v is PromiseLike<unknown> {
  return !!v && typeof (v as PromiseLike<unknown>).then === "function";
}

function commit(item: string, videoId: string, t: unknown): boolean {
  if (typeof t !== "number" || !Number.isFinite(t) || t < 0) return false;
  if (!getSavedIds("videos").includes(videoId)) return false;

  const currentData = safeParse<{ initialTime?: number; videoId?: string } | Record<string, unknown>>(safeGetItem(item), {});
  if (typeof currentData !== "object" || !currentData || Array.isArray(currentData)) return false;

  const data = {
    ...currentData,
    videoId,
    initialTime: t,
  };

  safeSetItem(item, JSON.stringify(data));
  return true;
}

export default function saveVideoProgress(videoPlayer: YouTubePlayer, videoId: string): Promise<void> {
  const item = `v=${videoId}`;

  if (!videoPlayer) return Promise.resolve();
  if (!getSavedIds("videos").includes(videoId)) return Promise.resolve();

  const token = Symbol();
  pendingSaves.set(item, token);

  try {
    const t = videoPlayer.getCurrentTime();

    if (isThenable(t)) {
      return Promise.resolve(t as PromiseLike<number>)
        .then((v) => {
          if (pendingSaves.get(item) !== token) return;
          commit(item, videoId, v);
        })
        .catch(() => {})
        .finally(() => {
          if (pendingSaves.get(item) === token) pendingSaves.delete(item);
        });
    }

    if (pendingSaves.get(item) === token) {
      commit(item, videoId, t);
      pendingSaves.delete(item);
    }
    return Promise.resolve();
  } catch {
    if (pendingSaves.get(item) === token) pendingSaves.delete(item);
    return Promise.resolve();
  }
}
