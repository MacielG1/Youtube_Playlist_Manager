export default async function getPlaylistSize(playlistId: string) {
  try {
    const res = await fetch(`/api/playlistSize/${playlistId}`);
    if (!res.ok) {
      console.log(`Error: ${res.status}, ${res.statusText}`);
      return;
    }
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      } else {
        throw new Error("Something went wrong. Please try again later.");
      }
    }
    let playlistLength = await res.json();

    return playlistLength;
  } catch (err) {
    console.log("Error in getPlaylistSize", err);
    throw err;
  }
}
