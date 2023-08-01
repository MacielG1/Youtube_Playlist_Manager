export default async function getPlaylistsData() {
  const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
  console.log("playlistData", allPlaylists);

  if (allPlaylists.length) {
    const playlistsIds = allPlaylists.join(",");
    const res = await fetch(`/api/playlistsData`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ playlistsIds }),
    });
    let data = await res.json();
    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }

    return data;
  }
  return {};
}
