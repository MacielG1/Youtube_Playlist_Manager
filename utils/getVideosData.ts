import { Video } from "@/types";
import { setMany } from "idb-keyval";
import { fetchMetadata } from "@/utils/fetchMetadata";
import { getSavedIds } from "@/utils/safeLocalStorage";

export default async function getVideosData(newVideoId?: string) {
  const videosIds = newVideoId
    ? newVideoId
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : getSavedIds("videos");

  if (videosIds.length === 0) {
    return { items: [] };
  }

  try {
    const items = await fetchMetadata<Video>(videosIds, {
      endpoint: "/api/videosData",
      bodyKey: "videosIds",
    });

    try {
      await setMany(items.map((item) => [`v=${item.id}`, item]));
    } catch (cacheError) {
      console.warn("getVideosData cache write failed", cacheError);
    }

    return { items };
  } catch (err) {
    console.log("Error in getVideosData", err);
    throw err;
  }
}
