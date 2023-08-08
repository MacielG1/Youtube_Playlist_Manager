import { YouTubePlayer } from "react-youtube";

export default function saveVideoProgress(videoPlayer: YouTubePlayer, videoId: string) {
  const data = {
    videoId,
    initialTime: videoPlayer.getCurrentTime() as number,
  };
  const item = `v=${videoId}`;

  localStorage.setItem(item, JSON.stringify(data));
}
