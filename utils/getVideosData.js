export default async function getData() {
  let allVideos = JSON.parse(localStorage.getItem("videos"));

  const videosIds = allVideos.join(",");

  if (!videosIds.length) return {};

  let res = await fetch("/api/videosData", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ videosIds }),
  });
  let data = await res.json();
  if (!data) {
    console.log("Error", res.statusText);
    return {};
  }
  return data;
}
