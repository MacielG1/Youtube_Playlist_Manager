import getVideosSlice from "./getVideosSlice";
import { YouTubePlayer } from "react-youtube";

const LOAD_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 100;

export default async function loadPlaylist(Player: YouTubePlayer, videoIds: string[], page = 1, index = 0, timing?: { timeoutMs?: number; pollIntervalMs?: number }) {
  try {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error("Invalid playlist page");
    }
    if (!Number.isInteger(index) || index < 0) {
      throw new Error("Invalid playlist index");
    }

    const videosArr = getVideosSlice(videoIds, page);

    if (!videosArr || videosArr.length === 0) {
      throw new Error("No videos to load in playlist");
    }
    if (index >= videosArr.length) {
      throw new Error("Playlist index out of range");
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

      // Timeout waiting for ready, resolve anyway
      timeoutId = setTimeout(() => {
        finish(() => reject(new Error("Playlist loading timeout")));
      }, timing?.timeoutMs ?? LOAD_TIMEOUT_MS);

      const sliceMatches = (pl: unknown) => Array.isArray(pl) && pl.length === videosArr.length && pl.every((v, i) => v === videosArr[i]);

      const waitForReady = async () => {
        // After loadPlaylist fires, poll until player reports a valid playlist index
        // (means new playlist is loaded and player is ready to accept commands)
        while (!settled) {
          try {
            const [idx, pl] = await Promise.all([Player.getPlaylistIndex(), Player.getPlaylist()]);
            if (settled) return;
            if (Number.isInteger(idx) && idx >= 0 && idx < videosArr.length && sliceMatches(pl)) {
              // Explicitly play at target index — loadPlaylist may cue without auto-playing
              try {
                await Player.playVideoAt(index);
              } catch (err) {
                finish(() => reject(err instanceof Error ? err : new Error("playVideoAt failed")));
                return;
              }
              finish(() => resolve(true));
              return;
            }
          } catch {
            // player not ready yet
          }
          await sleep(timing?.pollIntervalMs ?? POLL_INTERVAL_MS);
        }
      };

      const run = async () => {
        try {
          await Player.loadPlaylist(videosArr, index);
        } catch (error) {
          finish(() => reject(error instanceof Error ? error : new Error("Playlist load failed")));
          return;
        }
        await waitForReady();
      };

      void run();
    });
  } catch (error) {
    console.error("Error in loadPlaylist:", error);
    throw error;
  }
}
