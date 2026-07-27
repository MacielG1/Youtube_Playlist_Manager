import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

type Params = {
  playlistId: string;
};

export async function GET(req: Request, props: { params: Promise<Params> }): Promise<NextResponse> {
  const params = await props.params;
  const playlistId = params.playlistId;

  if (!playlistId || !/^[A-Za-z0-9_-]+$/.test(playlistId)) {
    return new NextResponse("Invalid Playlist Id", { status: 400 });
  }

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistId}&key=${API_KEY}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.log(`Error in /api/playlistSize/[playlistId]`, res.status, res.statusText);
      return new NextResponse("Error", { status: 404 });
    }
    let data = await res.json();
    if (!data.items || data.items.length === 0) {
      return new NextResponse("Playlist not found", { status: 404 });
    }
    let playlistLength = data.items[0]?.contentDetails?.itemCount;
    if (playlistLength === undefined) {
      return new NextResponse("Unable to determine playlist size", { status: 404 });
    }

    return NextResponse.json(playlistLength, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
  } catch (e) {
    console.log("Error in /api/playlistSize/[playlistId]");
    return new NextResponse("Error", { status: 404 });
  }
}
