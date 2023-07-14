export default async function seekTime(isPlayingRef, playerRef, time) {
  if (isPlayingRef) {
    const player = playerRef.current.internalPlayer;
    const currentTime = await player.getCurrentTime();

    player.seekTo(currentTime + time);
  }
}
