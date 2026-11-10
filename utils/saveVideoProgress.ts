import { YouTubePlayer } from "react-youtube";
import { getSavedIds, safeGetItem, safeParse, safeSetItem } from "@/utils/safeLocalStorage";

export default async function saveVideoProgress(videoPlayer: YouTubePlayer, videoId: string) {
  try {
    const item = `v=${videoId}`;

    if (!videoPlayer) return;
    const t = await videoPlayer.getCurrentTime();
    if (typeof t !== "number" || !Number.isFinite(t) || t < 0) return;

    const currentData = safeParse<{ initialTime?: number; videoId?: string } | null>(safeGetItem(item), null);
    if (!currentData || typeof currentData !== "object" || Array.isArray(currentData)) return;
    if (!getSavedIds("videos").includes(videoId)) return;

    const data = {
      ...currentData,
      videoId,
      initialTime: t,
    };

    safeSetItem(item, JSON.stringify(data));
  } catch {
    return;
  }
}
