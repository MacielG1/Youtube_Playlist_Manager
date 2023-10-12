export default async function getVideoData(newVideoId?: string) {
  let videosIds = "";

  if (newVideoId) {
    videosIds = newVideoId;
  } else {
    const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");
    if (!allVideos.length) return {};

    videosIds = allVideos.join(",");
  }

  try {
    const res = await fetch("/api/videosData", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ videosIds }),
    });
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      } else {
        throw new Error("Something went wrong. Please try again later.");
      }
    }

    const data = await res.json();

    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }
    return data;
  } catch (err) {
    console.log("Error in getVideosData", err);
    throw err;
  }
}
