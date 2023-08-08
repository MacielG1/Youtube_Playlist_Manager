"use client";
export default function getHeightWidth() {
  let height, width;

  if (typeof window === "undefined") return { height: 0, width: 0 };
  const screenRatio = 16 / 9; // Aspect ratio of 16:9
  const screenAspectRatio = window.innerWidth / window.innerHeight;

  if (screenAspectRatio > screenRatio) {
    height = window.innerHeight * 0.7;
    width = height * screenRatio;
  } else {
    width = window.innerWidth * 0.9;
    height = width / screenRatio;
  }
  return { height, width };
}
