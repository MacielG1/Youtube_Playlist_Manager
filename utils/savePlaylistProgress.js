export default async function savePlaylistsProgress(videoPlayer, playlistId, page, index) {
  const data = {
    playlistId,
    currentItem: index || (await videoPlayer.getPlaylistIndex()) || 0,
    initialTime: (await videoPlayer.getCurrentTime()) || 0,
    currentPage: page || 1,
  };
  let item = `pl=${playlistId}`;

  localStorage.setItem(item, JSON.stringify(data));
}
