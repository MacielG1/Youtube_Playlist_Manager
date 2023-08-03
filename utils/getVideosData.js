export default async function getVideosData() {
  const allVideos = JSON.parse(localStorage.getItem("videos")) || [];

  if (!allVideos.length) return {};

  const videosIds = allVideos.join(",");

  try {
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
  } catch (err) {
    console.log("Error in getVideosData", err.message);
    return {};
  }
}
