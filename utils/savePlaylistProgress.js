export default function savePlaylistsProgress(videoPlayer, playlistId, page) {
  const data = {
    playlistId,
    currentItem: videoPlayer.getPlaylistIndex(),
    initialTime: videoPlayer.getCurrentTime(),
    currentPage: page || 1,
  };
  let item = `pl=${playlistId}`;

  localStorage.setItem(item, JSON.stringify(data));
}
