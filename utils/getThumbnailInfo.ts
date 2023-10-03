import { Thumbnails } from "@/types";

export function getThumbnailInfo(thumbnails?: Thumbnails) {
  let thumbnailURL;
  let noBlackBars;

  if (window.innerWidth <= 720) {
    thumbnailURL = thumbnails?.medium?.url || thumbnails?.default?.url || "";
    noBlackBars = true;
  } else {
    thumbnailURL = thumbnails?.maxres?.url || thumbnails?.standard?.url || thumbnails?.high?.url || thumbnails?.medium?.url || "";
    noBlackBars = /(maxres|medium)/.test(thumbnailURL);
  }

  return { thumbnailURL, noBlackBars };
}
