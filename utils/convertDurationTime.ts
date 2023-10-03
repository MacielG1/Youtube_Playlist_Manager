export default function convertDurationTime(duration: string): string {
  // Use a single regular expression to extract hours, minutes, and seconds
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(\d+)S/;

  // Use regex to match and extract hours, minutes, and seconds
  const [, hours, minutes, seconds] = duration.match(regex) || [];

  // Convert hours, minutes, and seconds to numbers
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  const s = Number(seconds) || 0;

  // Format the time as HH:MM:SS
  const formattedTime = (h > 0 ? h.toString().padStart(2, "0") + ":" : "") + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");

  return formattedTime;
}
