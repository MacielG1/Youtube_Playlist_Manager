export default async function savePlaylistsProgress(videoPlayer, playlistId, page, index) {
  const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];

  const i = allPlaylists.indexOf(playlistId);

  if (i === -1) {
    console.log("Playlist not found");
    return;
  }

  const data = {
    playlistId,
    currentItem: index || (await videoPlayer.getPlaylistIndex()) || 0,
    initialTime: (await videoPlayer.getCurrentTime()) || 0,
    currentPage: page || 1,
  };
  const item = `pl=${playlistId}`;

  localStorage.setItem(item, JSON.stringify(data));
}
