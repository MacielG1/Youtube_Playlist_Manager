import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

type Params = {
  playlistId: string;
};

export async function GET(req: Request, { params }: { params: Params }): Promise<NextResponse> {
  const playlistId = params.playlistId;

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistId}&key=${API_KEY}`);

    if (!res.ok) {
      console.log(`Error in /api/playlistSize/[playlistId]`, res.status, res.statusText);
      return new NextResponse("Error", { status: 404 });
    }
    let data = await res.json();
    let playlistLength = data.items[0].contentDetails.itemCount;

    return NextResponse.json(playlistLength);
  } catch (e) {
    console.log("Error in /api/playlistSize/[playlistId]");
    return new NextResponse("Error", { status: 404 });
  }
}
