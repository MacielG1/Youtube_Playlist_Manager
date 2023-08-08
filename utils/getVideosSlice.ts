export default function getVideosSlice(videosArr: string[], page = 1) {
  const startIndex = (page - 1) * 200;
  const endIndex = Math.min(startIndex + 200, videosArr.length);
  return videosArr.slice(startIndex, endIndex);
}
