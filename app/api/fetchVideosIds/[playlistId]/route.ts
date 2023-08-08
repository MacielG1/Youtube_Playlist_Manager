import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;
export const runtime = "edge";

type Params = {
  playlistId: string;
};

export async function POST(req: Request, { params }: { params: Params }) {
  let { existingVideoIds } = await req.json();

  const playlistsToFetch = params.playlistId;

  if (!playlistsToFetch) return;

  let nextPageToken = "";
  let videos = [];

  const newExistingVideoIds = existingVideoIds.toReversed();

  try {
    do {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistsToFetch}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
      );
      if (!res.ok) {
        console.log("Error in /api/fetch_write_videos/[playlistId]", res.status, res.statusText);

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

        videos.push(videoId);
      }

      if (foundDuplicate) {
        break;
      }

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return NextResponse.json([...existingVideoIds, ...videos]);
  } catch (e) {
    console.log("Error in /api/fetch_write_videos/[playlistId]");
    return new NextResponse("Error", { status: 404 });
  }
}
