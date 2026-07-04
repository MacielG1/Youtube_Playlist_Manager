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

      const waitForReady = async () => {
        // After loadPlaylist fires, poll until player reports a valid playlist index
        // (means new playlist is loaded and player is ready to accept commands)
        for (let attempt = 0; attempt < 30 && !settled; attempt += 1) {
          try {
            const idx = await Player.getPlaylistIndex();
            const pl = await Player.getPlaylist();
            if (typeof idx === "number" && pl && pl.length > 0) {
              // Explicitly play at target index — loadPlaylist may cue without auto-playing
              try {
                await Player.playVideoAt(index);
              } catch (err) {
                console.warn("[loadPlaylist] playVideoAt failed:", err);
              }
              finish(() => resolve(true));
              return;
            }
          } catch {
            // player not ready yet
          }
          await sleep(100);
        }
        // Timeout waiting for ready, resolve anyway
        finish(() => resolve(true));
      };

      const loadPlaylistInternal = async () => {
        try {
          for (let attempt = 0; attempt < 4 && !settled; attempt += 1) {
            try {
              const state = await Player.getPlayerState();

              if (settled) return;

              if (state === 5) {
                await Player.loadPlaylist(videosArr, index);
                await waitForReady();
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

            await waitForReady();
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
