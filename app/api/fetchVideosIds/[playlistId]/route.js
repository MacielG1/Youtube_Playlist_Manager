import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;
export const runtime = "edge";
export async function POST(req, { params }) {
  let { existingVideoIds } = await req.json();

  const playlistsToFetch = params.playlistId;

  let nextPageToken = "";
  let videos = [];

  let newExistingVideoIds = existingVideoIds.toReversed();

  do {
    let res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistsToFetch}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
    );
    if (!res.ok) {
      console.log(res);
      console.log("Error fetching in fetch_write_videos, Access Token Invalid", res.statusText);
      throw new Error("ERROR");
    }
    let data = await res.json();

    let foundDuplicate = false;
    // let c = 0;
    for (let item of data.items) {
      // c++;
      // if (c == 3) break;
      const videoId = item.snippet.resourceId.videoId;

      if (newExistingVideoIds.includes(videoId)) {
        console.log("DUPLICATE VIDEO", videoId);
        foundDuplicate = true;
        break; // Stop the loop if a duplicate video is found
      }
      console.log("NEW VIDEO", videoId);
      videos.push(videoId);
    }

    if (foundDuplicate) {
      break; // Stop the outer loop if a duplicate video is found
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return NextResponse.json([...existingVideoIds, ...videos]);
}
