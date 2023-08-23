import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;
export const runtime = "edge";

type Params = {
  playlistId: string;
};

export async function POST(req: Request, { params }: { params: Params }) {
  // let { existingVideoIds } = await req.json();
  // const newExistingVideoIds = existingVideoIds.toReversed();

  const playlistsToFetch = params.playlistId;

  if (!playlistsToFetch) return;

  let nextPageToken = "";

  const allIds = [];
  try {
    do {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistsToFetch}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
      );
      if (!res.ok) {
        console.log("Error in /api/fetchVideosIds/[playlistId]", res.status, res.statusText);
        throw new Error("ERROR");
      }
      let data = await res.json();

      for (let item of data.items) {
        allIds.push(item.contentDetails.videoId);
      }

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return NextResponse.json(allIds);
  } catch (e: any) {
    console.log("Error in /api/fetch_write_videos/[playlistId]", e.message);
    return new NextResponse("Error", { status: 404 });
  }
}
