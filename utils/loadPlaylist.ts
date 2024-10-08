import getVideosSlice from "./getVideosSlice";
import { YouTubePlayer } from "react-youtube";

export default async function loadPlaylist(Player: YouTubePlayer, videoIds: string[], page = 1, index = 0) {
  const videosArr = getVideosSlice(videoIds, page);

  await Player.cuePlaylist({ playlist: videosArr, index, startSeconds: 0.1 });

  setTimeout(async () => {
    const loadPlaylist = async () => {
      const state = await Player.getPlayerState();

      if (state === 5) {
        await Player.loadPlaylist(videosArr, index);
      } else {
        setTimeout(() => {
          loadPlaylist();
        }, 1000);
      }
    };
    await loadPlaylist();

    return true;
  }, 500);
}
