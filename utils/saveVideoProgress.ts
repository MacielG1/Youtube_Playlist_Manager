import { YouTubePlayer } from "react-youtube";

export default function saveVideoProgress(videoPlayer: YouTubePlayer, videoId: string) {
  const item = `v=${videoId}`;

  const currentData = JSON.parse(localStorage.getItem(item) as string);

  const data = {
    ...currentData,
    videoId,
    initialTime: videoPlayer.getCurrentTime() as number,
  };

  localStorage.setItem(item, JSON.stringify(data));
}
