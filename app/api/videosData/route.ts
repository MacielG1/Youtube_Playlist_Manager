import { VideoAPI } from "@/types";
import convertDurationTime from "@/utils/convertDurationTime";
import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export async function POST(req: Request): Promise<NextResponse> {
  const { videosIds } = await req.json();

  if (!videosIds || typeof videosIds !== "string") return new NextResponse("No Video Id", { status: 404 });

  const ids = videosIds.split(",").filter((id: string) => id && /^[A-Za-z0-9_-]+$/.test(id));
  if (ids.length === 0) return new NextResponse("Invalid Video Id", { status: 400 });
  const validatedIds = ids.join(",");

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${validatedIds}&key=${API_KEY}&maxResults=50`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.log(`Error in /api/videosData`, res.status, res.statusText);
      return new NextResponse("Error", { status: 404 });
    }

    const data = await res.json();

    if (!data) {
      console.log("Error", res.statusText);
      return new NextResponse("Error", { status: 404 });
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    let newData = {
      items: data.items.map((item: VideoAPI) => {
        return {
          id: item.id,
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails,
          description: item.snippet.description,
          duration: convertDurationTime(item.contentDetails.duration),
          channel: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
        };
      }),
    };

    return NextResponse.json(newData, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
  } catch (e) {
    console.log("Error in /api/videosData");
    return new NextResponse("Error", { status: 404 });
  }
}
