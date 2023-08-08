import YouTube from "react-youtube";

type IsPlayingRef = React.MutableRefObject<boolean | null>;
type PlayerRef = React.MutableRefObject<YouTube | null>;

export default async function seekTime(isPlayingRef: IsPlayingRef, playerRef: PlayerRef, time: number) {
  if (isPlayingRef) {
    const player = playerRef.current?.internalPlayer;
    const currentTime = await player.getCurrentTime();

    player.seekTo(currentTime + time);
  }
}
