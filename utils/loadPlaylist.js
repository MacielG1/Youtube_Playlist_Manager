import getVideosSlice from "./getVideosSlice";

export default async function loadPlaylist(Player, videoIds, page, index = 0) {
  const videosArr = getVideosSlice(videoIds, page);

  await Player.cuePlaylist({ playlist: videosArr, index: index, startSeconds: 0.1 });

  setTimeout(async () => {
    const loadPlaylist = async () => {
      const state = await Player.getPlayerState();

      if (state === 5) {
        await Player.loadPlaylist(videosArr, index, 0.1);
      } else {
        setTimeout(loadPlaylist, 500); // Retry loading after a delay
      }
    };
    await loadPlaylist();
  }, 500);
}
