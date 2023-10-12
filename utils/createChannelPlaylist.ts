export default async function getChannelId(name: string) {
  try {
    const res = await fetch(`/api/channelId/${encodeURIComponent(name)}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      } else {
        throw new Error("Something went wrong. Please try again later.");
      }
    }

    const channelId = await res.json();
    if (!channelId) {
      return null;
    }

    return channelId;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
