export default function saveVideoProgress(videoPlayer, videoId) {
  const data = {
    videoId,
    initialTime: videoPlayer.getCurrentTime(),
  };
  const item = `v=${videoId}`;

  localStorage.setItem(item, JSON.stringify(data));
}
