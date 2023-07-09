export default async function skip10seconds(isPlayingRef, playerRef) {
  if (isPlayingRef) {
    const player = playerRef.current.internalPlayer;
    const currentTime = await player.getCurrentTime();
    player.seekTo(currentTime + 10);
  }
}
