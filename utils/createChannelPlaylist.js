export default async function createChannelPlaylist(name) {
  try {
    const res = await fetch(`/api/channelId/${encodeURIComponent(name)}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    if (!res.ok) {
      return null;
    }

    const channelId = await res.json();
    if (!channelId) {
      return null;
    }

    return channelId;
  } catch (e) {
    console.log(e);
    return null;
  }
}
