import YouTube from "react-youtube";

type IsPlayingRef = React.MutableRefObject<boolean | null>;
type PlayerRef = React.MutableRefObject<YouTube | null>;

export default async function seekTime(isPlayingRef: IsPlayingRef, playerRef: PlayerRef, time: number) {
  const player = playerRef.current?.internalPlayer;
  if (isPlayingRef.current && player) {
    const currentTime = await player.getCurrentTime();

    player.seekTo(currentTime + time);
  }
}
