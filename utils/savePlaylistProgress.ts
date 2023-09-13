import { YouTubePlayer } from "react-youtube";

export default async function savePlaylistsProgress(videoPlayer: YouTubePlayer, playlistId: string, page: number, index?: number) {
  const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");

  const i = allPlaylists.indexOf(playlistId);
  if (i === -1) return; // if playlist is not in the list, return

  const item = `pl=${playlistId}`;

  const currentPl = JSON.parse(localStorage.getItem(item) || "[]");

  const data = {
    ...currentPl,
    playlistId,
    currentItem: index || ((await videoPlayer?.getPlaylistIndex()) as number) || 0,
    initialTime: ((await videoPlayer?.getCurrentTime()) as number) || 0,
    currentPage: page || 1,
  };

  localStorage.setItem(item, JSON.stringify(data));
}
