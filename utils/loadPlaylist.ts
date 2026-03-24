import getVideosSlice from "./getVideosSlice";
import { YouTubePlayer } from "react-youtube";

export default async function loadPlaylist(Player: YouTubePlayer, videoIds: string[], page = 1, index = 0) {
  try {
    const videosArr = getVideosSlice(videoIds, page);

    if (!videosArr || videosArr.length === 0) {
      throw new Error("No videos to load in playlist");
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    await Player.cuePlaylist({ playlist: videosArr, index, startSeconds: 0.1 });

    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        callback();
      };

      timeoutId = setTimeout(() => {
        finish(() => reject(new Error("Playlist loading timeout")));
      }, 15000);

      const loadPlaylistInternal = async () => {
        try {
          for (let attempt = 0; attempt < 4 && !settled; attempt += 1) {
            try {
              const state = await Player.getPlayerState();

              if (settled) return;

              if (state === 5) {
                await Player.loadPlaylist(videosArr, index);
                finish(() => resolve(true));
                return;
              }
            } catch (error) {
              console.warn("Could not read player state while loading playlist:", error);
              break;
            }

            await sleep(500);
          }

          if (!settled) {
            try {
              await Player.loadPlaylist(videosArr, index);
            } catch (error) {
              console.warn("Fallback playlist load failed:", error);
            }

            finish(() => resolve(true));
          }
        } catch (error) {
          finish(() => reject(error));
        }
      };

      void loadPlaylistInternal();
    });
  } catch (error) {
    console.error("Error in loadPlaylist:", error);
    throw error;
  }
}
