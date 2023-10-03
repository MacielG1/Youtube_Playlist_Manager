import { PlaylistAPI, VideoAPI } from "@/types";
import convertDurationTime from "@/utils/convertDurationTime";
import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";
export async function POST(req: Request): Promise<NextResponse> {
  const { videosIds } = await req.json();

  if (!videosIds) return new NextResponse("No Playlist Id", { status: 404 });

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videosIds}&key=${API_KEY}&maxResults=50`);

    if (!res.ok) {
      console.log(`Error in /api/videosData`, res.status, res.statusText);
      return new NextResponse("Error", { status: 404 });
    }

    const data = await res.json();

    if (!data) {
      console.log("Error", res.statusText);
      return new NextResponse("Error", { status: 404 });
    }

    let newData = {
      items: data.items.map((item: VideoAPI) => {
        return {
          id: item.id,
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails,
          description: item.snippet.description,
          duration: convertDurationTime(item.contentDetails.duration),
        };
      }),
    };
    return NextResponse.json(newData);
  } catch (e) {
    console.log("Error in /api/videosData");
    return new NextResponse("Error", { status: 404 });
  }
}
