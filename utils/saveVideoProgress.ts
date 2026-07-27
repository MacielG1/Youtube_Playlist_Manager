import { YouTubePlayer } from "react-youtube";
import { safeParse, safeSetItem } from "@/utils/safeLocalStorage";

export default function saveVideoProgress(videoPlayer: YouTubePlayer, videoId: string) {
  const item = `v=${videoId}`;

  const currentData = safeParse<{ initialTime?: number; videoId?: string } | null>(localStorage.getItem(item), null);

  if (!currentData) return;

  if (!videoPlayer) return;
  const t = videoPlayer.getCurrentTime();
  if (!t) return;

  const data = {
    ...currentData,
    videoId,
    initialTime: t as number,
  };

  safeSetItem(item, JSON.stringify(data));
}
