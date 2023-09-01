export default async function getVideoData(newVideoId: string) {
  try {
    const res = await fetch(`/api/videosData`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ videosIds: newVideoId }),
    });

    if (!res.ok) {
      console.log("Error", res.statusText);
    }

    let data = await res.json();

    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }
    return data;
  } catch (error) {
    console.log("Error in getVideoData", error);
    return {};
  }
}
