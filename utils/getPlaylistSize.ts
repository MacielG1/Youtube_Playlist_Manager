export default async function getPlaylistSize(playlistId: string) {
  try {
    const res = await fetch(`/api/playlistSize/${playlistId}`);
    if (!res.ok) {
      console.log(`Error: ${res.status}, ${res.statusText}`);
      return;
    }

    let playlistLength = await res.json();

    return playlistLength;
  } catch (err) {
    console.log("Error in getPlaylistSize", err);
    return null;
  }
}
