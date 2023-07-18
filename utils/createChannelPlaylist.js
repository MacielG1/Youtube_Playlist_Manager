export default async function createChannelPlaylist(name) {
  try {
    const res = await fetch(`/api/channelId/${encodeURIComponent(name)}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    console.log("res", res);
    if (!res.ok) {
      return null;
    }

    const channelId = await res.json();
    console.log("1", channelId);
    if (!channelId) {
      return null;
    }

    return channelId;
  } catch (e) {
    console.log(e);
    return null;
  }
}
