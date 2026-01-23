import type { Playlist, Thumbnails } from "@/types";

export default async function getPlaylistsData(newPlaylistId?: string) {
  let playlistsIds = "";

  if (newPlaylistId) {
    playlistsIds = newPlaylistId;
  } else {
    const allPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");

    if (allPlaylists.length === 0) {
      return {};
    }
    playlistsIds = allPlaylists.join(",");
  }
  try {
    const res = await fetch(`/api/playlistsData`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ playlistsIds }),
    });

    if (!res.ok) {
      console.log("Error", res);
      if (res.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      } else {
        throw new Error("Something went wrong. Please try again later.");
      }
    }

    let data = await res.json();
    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }

    // Apply custom thumbnails if set
    const customThumbnails = JSON.parse(localStorage.getItem("customPlaylistThumbnails") || "{}");
    if (data.items && Object.keys(customThumbnails).length > 0) {
      data.items = data.items.map((item: Playlist) => {
        if (customThumbnails[item.id]) {
          return { ...item, thumbnails: customThumbnails[item.id] as Thumbnails };
        }
        return item;
      });
    }

    return data;
  } catch (error) {
    console.log("Error in getPlaylistsData", error);
    throw error;
  }
}
