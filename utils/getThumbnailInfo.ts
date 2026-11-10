import { Thumbnails } from "@/types";

const FALLBACK_ORDER: (keyof Thumbnails)[] = ["medium", "maxres", "standard", "high", "default"];

export function getThumbnailInfo(thumbnails?: Thumbnails) {
  let thumbnailURL = "";
  let chosenKey: keyof Thumbnails | undefined;

  for (const key of FALLBACK_ORDER) {
    const url = thumbnails?.[key]?.url;
    if (url) {
      thumbnailURL = url;
      chosenKey = key;
      break;
    }
  }

  const hasBlackBars = chosenKey !== "medium" && chosenKey !== "maxres";

  return { thumbnailURL, hasBlackBars };
}
