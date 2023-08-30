export default async function getVideosData() {
  const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");

  console.log("allVideos", allVideos);

  if (!allVideos.length) return {};

  const videosIds: string[] = allVideos.join(",");

  try {
    const res = await fetch("/api/videosData", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ videosIds }),
    });
    const data = await res.json();
    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }
    return data;
  } catch (err) {
    console.log("Error in getVideosData", err);
    return {};
  }
}
