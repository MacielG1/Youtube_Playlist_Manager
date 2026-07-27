import { Playlist, PlaylistAPI } from "@/types";
import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export async function POST(req: Request): Promise<NextResponse> {
  const { playlistsIds } = await req.json();

  if (!playlistsIds || typeof playlistsIds !== "string") return new NextResponse("No Playlist Id", { status: 404 });

  const ids = playlistsIds.split(",").filter((id: string) => id && /^[A-Za-z0-9_-]+$/.test(id));
  if (ids.length === 0) return new NextResponse("Invalid Playlist Id", { status: 400 });
  const validatedIds = ids.join(",");

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${validatedIds}&key=${API_KEY}&maxResults=50`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.log(`Error in /api/playlistsData`, res.status, res.statusText);
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
      items: data.items.map((item: PlaylistAPI) => {
        return {
          id: item.id,
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails,
        };
      }),
    };

    return NextResponse.json(newData, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
  } catch (e) {
    console.log("Error in /api/playlistsData", e);
    return new NextResponse("Error", { status: 400 });
  }
}
