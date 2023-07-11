export default function saveVideoProgress(videoPlayer, videoId) {
  const data = {
    videoId,
    initialTime: videoPlayer.getCurrentTime(),
  };
  let item = `v=${videoId}`;

  localStorage.setItem(item, JSON.stringify(data));
}
