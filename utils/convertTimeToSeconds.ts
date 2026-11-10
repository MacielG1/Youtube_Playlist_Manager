export default function convertTimeToSeconds(timeString: string): number {
  // console.log("timeString", timeString);
  const hmsMatch = timeString.match(/^(\d+):([0-5]?\d):([0-5]?\d)$/);
  if (hmsMatch) {
    const hours = parseInt(hmsMatch[1], 10);
    const minutes = parseInt(hmsMatch[2], 10);
    const seconds = parseInt(hmsMatch[3], 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  const msMatch = timeString.match(/^(\d+):([0-5]?\d)$/);
  if (msMatch) {
    const minutes = parseInt(msMatch[1], 10);
    const seconds = parseInt(msMatch[2], 10);
    return minutes * 60 + seconds;
  }

  const sMatch = timeString.match(/^(\d{1,2})$/);
  if (sMatch) {
    return parseInt(sMatch[1], 10);
  }

  console.error("Invalid time format. Please use HH:MM:SS, MM:SS, or SS");
  return 0;
}
