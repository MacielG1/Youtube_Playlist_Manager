export default async function getPlaylistsData() {
  const allPlaylists = JSON.parse(localStorage.getItem("playlists")) || [];

  const playlistsIds = allPlaylists.join(",");

  if (allPlaylists.length) {
    let res = await fetch(`/api/playlistsData`, {
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
