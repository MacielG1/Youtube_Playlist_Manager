// export default async function resetPlaylist(Player, playlistId, index = 0) {
//   await Player.cuePlaylist({
//     listType: "playlist",
//     list: playlistId,
//     index: index,
//     startSeconds: 0,
//   });
//   setTimeout(async () => {
//     const loadPlaylist = async () => {
//       const state = await Player.getPlayerState();
//       if (state === 5) {
//         await Player.loadPlaylist({
//           listType: "playlist",
//           list: playlistId,
//           index: index,
//           startSeconds: 0 || 1,
//         });
//       } else {
//         setTimeout(loadPlaylist, 1000); // Retry loading after a delay
//       }
//     };
//     await loadPlaylist();
//   }, 500);
// }

export default async function resetPlaylist(Player, playlistId, index = 0) {
  await Player.loadPlaylist({
    listType: "playlist",
    list: playlistId,
    index: index,
    startSeconds: 0,
  });
  setTimeout(async () => {
    const loadPlaylist = async () => {
      const state = await Player.getPlayerState();
      if (state === 5) {
        await Player.loadPlaylist({
          listType: "playlist",
          list: playlistId,
          index: index,
          startSeconds: 0,
        });
      } else {
        setTimeout(loadPlaylist, 1000); // Retry loading after a delay
      }
    };
    await loadPlaylist();
  }, 500);
}
