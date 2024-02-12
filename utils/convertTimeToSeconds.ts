export default function convertTimeToSeconds(timeString: string): number {
  // console.log("timeString", timeString);
  const timeRegex = /^((\d{1,2}):)?(\d{2}):(\d{2})$/;
  const match = timeString.match(timeRegex);

  if (!match) {
    console.error("Invalid time format. Please use HH:MM:SS, MM:SS, or SS");
    return 0;
  }

  const hours = match[2] ? parseInt(match[2], 10) : 0;
  const minutes = parseInt(match[3], 10);
  const seconds = parseInt(match[4], 10);

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    console.error("Invalid time components. Please use valid numbers.");
    return 0;
  }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds;
}
