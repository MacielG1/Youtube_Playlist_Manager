export default async function getPlaylistsData(newPlaylistId?: string) {
  let playlistsIds = "";

  if (newPlaylistId) {
    playlistsIds = newPlaylistId;
  } else {
    const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");

<<<<<<< Updated upstream
    if (!allPlaylists.length) return {};
=======
    if (allPlaylists.length === 0) {
      return {};
    }
>>>>>>> Stashed changes
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
