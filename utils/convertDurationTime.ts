// export default function convertDurationTime(duration: string): string {
//   console.log({ duration });
//   // Use a single regular expression to extract hours, minutes, and seconds
//   const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;

//   // Use regex to match and extract hours, minutes, and seconds
//   const [, hours, minutes, seconds] = duration.match(regex) || [];

//   // Convert hours, minutes, and seconds to numbers
//   const h = Number(hours) || 0;
//   const m = Number(minutes) || 0;
//   const s = Number(seconds) || 0;

//   // Format the time as HH:MM:SS
//   const formattedTime = (h > 0 ? h.toString() + ":" : "") + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");

//   console.log("for", formattedTime);
//   return formattedTime;
// }
// //
export default function convertDurationTime(duration: string): string {
  // Use a single regular expression to extract days, hours, minutes, and seconds
  const regex = /P(?:([0-9]+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;

  // Use regex to match and extract days, hours, minutes, and seconds
  const [, days, hours, minutes, seconds] = duration.match(regex) || [];

  // Convert days, hours, minutes, and seconds to numbers
  const d = Number(days) || 0;
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  const s = Number(seconds) || 0;

  // If there are days, perform additional calculations
  if (d > 0) {
    const totalHours = d * 24 + h;
    // Format the time as HH:MM:SS
    const formattedTime =
      (totalHours > 0 ? totalHours.toString().padStart(2, "0") + ":" : "") + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
    console.log("for", formattedTime);
    return formattedTime;
  } else {
    // Format the time as HH:MM:SS
    const formattedTime = (h > 0 ? h.toString() + ":" : "") + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
    return formattedTime;
  }
}
