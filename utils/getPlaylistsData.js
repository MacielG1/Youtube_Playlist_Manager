export default async function getPlaylistsData() {
  const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];
  console.log("allPlaylists", allPlaylists);
  if (allPlaylists.length) {
    const playlistsIds = allPlaylists.join(",");
    const res = await fetch(`/api/playlistsData`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ playlistsIds }),
    });
    console.log("res", res);
    let data = await res.json();
    console.log("data2", data);
    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }

    return data;
  }
  return {};
}
