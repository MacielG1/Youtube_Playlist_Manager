import { VideoAPI } from "@/types";
import { set } from "idb-keyval";

export default async function getVideosData(newVideoId?: string) {
  let videosIds = "";

  if (newVideoId) {
    videosIds = newVideoId;
  } else {
    const allVideos = JSON.parse(localStorage.getItem("videos") || "[]");

    if (!allVideos.length) return {};
    // if (!allVideos.length) allVideos.push("4088CV88CdQ", "ucqReyBoEeU", "AY5qcIq5u2g", "NAVj5h0A070");

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
      console.log("Error", res);
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
    data.items.map(async (item: VideoAPI) => {
      await set(`v=${item.id}`, item);
      return item;
    });

    return data;
  } catch (err) {
    console.log("Error in getVideosData", err);
    throw err;
  }
}
