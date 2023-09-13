export default function reduceStringSize(inputString: string, maxSize = 50): string {
  if (inputString.length <= maxSize) return inputString;

  return inputString.slice(0, maxSize);
}
