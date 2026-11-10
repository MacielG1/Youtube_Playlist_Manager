import YouTube from "react-youtube";

type IsPlayingRef = React.MutableRefObject<boolean | null>;
type PlayerRef = React.MutableRefObject<YouTube | null>;

export default async function seekTime(isPlayingRef: IsPlayingRef, playerRef: PlayerRef, time: number) {
  try {
    const player = playerRef.current?.internalPlayer;
    if (isPlayingRef.current === null || !player) return;

    if (!Number.isFinite(time)) return;

    const [currentTime, duration] = await Promise.all([player.getCurrentTime(), player.getDuration()]);
    if (typeof currentTime !== "number" || !Number.isFinite(currentTime)) return;

    const upperBound = typeof duration === "number" && Number.isFinite(duration) && duration > 0 ? duration : Number.POSITIVE_INFINITY;
    const target = Math.min(Math.max(0, currentTime + time), upperBound);

    await player.seekTo(target);
  } catch {
    return;
  }
}
