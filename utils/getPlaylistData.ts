export default async function getPlaylistData(newPlaylistId: string) {
  try {
    const res = await fetch(`/api/playlistsData`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ playlistsIds: newPlaylistId }),
    });

    if (!res.ok) {
      console.log("Error", res.statusText);
    }

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
