import { PlaylistAPI } from "@/types";
import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;
export const runtime = "edge";

type Params = {
  playlistId: string;
};

let MAX_AMOUNT_OF_PAGES = 50;
export async function POST(req: Request, { params }: { params: Params }): Promise<NextResponse> {
  const playlistsToFetch = params.playlistId;

  if (!playlistsToFetch) return new NextResponse("No Playlist Id", { status: 404 });

  let pagesCounter = 0;
  let nextPageToken = "";

  const allVideos = [];
  try {
    do {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistsToFetch}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`,
      );
      if (!res.ok) {
        console.log("Error in /api/fetchVideosIds/[playlistId]", res.status, res.statusText);
        throw new Error("ERROR");
      }
      let data = await res.json();

      for (let item of data.items) {
        allVideos.push(item);
      }

      nextPageToken = data.nextPageToken;
      pagesCounter++;

      if (pagesCounter > MAX_AMOUNT_OF_PAGES) {
        break;
      }
    } while (nextPageToken);

    // Extract the data we need
    let newData = allVideos.map((item: PlaylistAPI) => {
      return {
        id: item.snippet.resourceId?.videoId,
        title: item.snippet.title,
        thumbnails: item.snippet.thumbnails,
      };
    });

    return NextResponse.json(newData);
  } catch (e) {
    console.log("Error in /api/fetch_write_videos/[playlistId]", e);
    return new NextResponse("Error", { status: 404 });
  }
}
