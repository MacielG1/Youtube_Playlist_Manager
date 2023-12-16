export default function reduceStringSize(inputString = "", maxSize = 50): string {
  if (inputString && inputString.length <= maxSize) return inputString;

  return inputString.slice(0, maxSize);
}
