import { Thumbnails } from "@/types";

export function getThumbnailInfo(thumbnails?: Thumbnails) {
  let thumbnailURL;
  let hasBlackBars;

  if (window.innerWidth <= 720) {
    thumbnailURL = thumbnails?.medium?.url || thumbnails?.default?.url || "";
    hasBlackBars = true;
  } else {
    thumbnailURL = thumbnails?.maxres?.url || thumbnails?.standard?.url || thumbnails?.high?.url || thumbnails?.medium?.url || "";
    hasBlackBars = !/(maxres|medium)/.test(thumbnailURL);
  }

  return { thumbnailURL, hasBlackBars };
}
