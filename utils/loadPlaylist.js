export default async function loadPlaylist(Player, videoIds, page, index = 0) {
  console.log("LOAD PLAYLIST", videoIds, page, index);
  await Player.cuePlaylist(getVideosSlice(videoIds, page), index, 0.1);

  setTimeout(async () => {
    const loadPlaylist = async () => {
      const state = await Player.getPlayerState();
      if (state === 5) {
        await Player.loadPlaylist(getVideosSlice(videoIds, page), index, 0.1);
      } else {
        setTimeout(loadPlaylist, 1000); // Retry loading after a delay
      }
    };
    loadPlaylist();
  }, 500);
}
