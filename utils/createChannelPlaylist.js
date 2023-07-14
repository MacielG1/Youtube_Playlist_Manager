export default async function getChannelId(name) {
  const res = await fetch(`/api/channelId/${name}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  });
  if (!res.ok) {
    console.log(`Error: ${res.status}, ${res.statusText}`);
  }
  const channelId = await res.json();

  if (!channelId) {
    console.log("Error", res.statusText);
    return {};
  }

  return channelId;
}
