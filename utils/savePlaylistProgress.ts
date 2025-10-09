import { YouTubePlayer } from "react-youtube";

export default async function savePlaylistsProgress(videoPlayer: YouTubePlayer, playlistId: string, page: number, index?: number) {
  const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");

  const i = allPlaylists.indexOf(playlistId);
  if (i === -1) return; // if playlist is not in the list, return

  const item = `pl=${playlistId}`;

  const currentPl = JSON.parse(localStorage.getItem(item) || "[]");

  if (!videoPlayer || !videoPlayer.getCurrentTime()) return;

  const currentTime = ((await videoPlayer?.getCurrentTime()) as number) || 0;
  const duration = ((await videoPlayer?.getDuration()) as number) || 0;
  const currentIndex = index !== undefined ? index : ((await videoPlayer?.getPlaylistIndex()) as number) || 0;

  // Check if video is 97% watched
  const isVideoFinished = duration > 0 && currentTime / duration >= 0.97;

  let nextIndex = currentIndex;
  let nextPage = page && page > 0 ? page : 1;

  if (isVideoFinished) {
    const savedItem = currentPl.currentItem || 0;
    const savedPage = currentPl.currentPage || 1;

    const savedAbsoluteIndex = savedItem + (savedPage - 1) * 200;
    const currentAbsoluteIndex = currentIndex + (page - 1) * 200;

    if (savedAbsoluteIndex <= currentAbsoluteIndex) {
      nextIndex = currentIndex + 1;

      if (nextIndex >= 200) {
        nextIndex = 0;
        nextPage = nextPage + 1;
      }
    }
  }

  const data = {
    ...currentPl,
    playlistId,
    currentItem: isVideoFinished ? nextIndex : currentIndex,
    initialTime: isVideoFinished ? 0 : currentTime,
    currentPage: nextPage,
  };

  localStorage.setItem(item, JSON.stringify(data));
}
