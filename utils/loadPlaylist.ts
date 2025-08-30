import getVideosSlice from "./getVideosSlice";
import { YouTubePlayer } from "react-youtube";

export default async function loadPlaylist(Player: YouTubePlayer, videoIds: string[], page = 1, index = 0) {
  try {
    const videosArr = getVideosSlice(videoIds, page);

    if (!videosArr || videosArr.length === 0) {
      throw new Error("No videos to load in playlist");
    }

    await Player.cuePlaylist({ playlist: videosArr, index, startSeconds: 0.1 });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Playlist loading timeout"));
      }, 15000); // 15 second timeout

      const loadPlaylistInternal = async () => {
        try {
          const state = await Player.getPlayerState();

          if (state === 5) {
            await Player.loadPlaylist(videosArr, index);
            clearTimeout(timeout);
            resolve(true);
          } else {
            setTimeout(() => {
              loadPlaylistInternal();
            }, 1000);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      setTimeout(() => {
        loadPlaylistInternal();
      }, 500);
    });
  } catch (error) {
    console.error("Error in loadPlaylist:", error);
    throw error;
  }
}
