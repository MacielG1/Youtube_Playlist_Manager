export default async function getPlaylistsData(newPlaylistId?: string) {
  let playlistsIds = "";

  if (newPlaylistId) {
    playlistsIds = newPlaylistId;
  } else {
    const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");

    if (!allPlaylists.length) return {};
    playlistsIds = allPlaylists.join(",");
  }
  try {
    const res = await fetch(`/api/playlistsData`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ playlistsIds }),
    });

    let data = await res.json();
    console.log("data", data);
    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }

    return data;
  } catch (error) {
    console.log("Error in getPlaylistsData", error);
    return {};
  }
}
