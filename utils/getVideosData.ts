export default async function getVideoData() {
  const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");

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
    console.log("data", data);
    return data;
  } catch (err) {
    console.log("Error in getVideosData", err);
    return {};
  }
}
