export default async function fetchVideosIds(playlistId: string, existingVideoIds: string[] = [], videosIdsRef: React.MutableRefObject<string[]>) {
  try {
    const res = await fetch(`/api/fetchVideosIds/${playlistId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ existingVideoIds }),
    });

    if (!res.ok) {
      return console.log("Error", res.statusText);
    }
    const data = await res.json();

    videosIdsRef.current = data;
    localStorage.setItem(`plVideos=${playlistId}`, JSON.stringify({ videosIds: data, updatedTime: Date.now() }));

    return data;
  } catch (error) {
    console.error("Error fetching data in FetchVideosIds:", error);
    return null;
  }
}
