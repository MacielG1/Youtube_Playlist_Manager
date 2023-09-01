export default async function getPlaylistsData() {
  const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");

  if (!allPlaylists.length) return {};

  const playlistsIds: string[] = allPlaylists.join(",");

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
