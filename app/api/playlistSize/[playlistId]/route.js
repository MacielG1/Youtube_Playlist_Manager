import { NextResponse } from "next/server";
export const runtime = "edge";
const API_KEY = process.env.YOUTUBE_API;

export async function GET(req, { params }) {
  const playlistId = params.playlistId;

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistId}&key=${API_KEY}`);

    if (!res.ok) {
      console.log(`Error in /api/playlistSize/[playlistId]`, res.status, res.statusText);
      return null;
    }
    let data = await res.json();
    let playlistLength = data.items[0].contentDetails.itemCount;

    return NextResponse.json(playlistLength);
  } catch (e) {
    console.log("Error in /api/playlistSize/[playlistId]", e.status, e.statusText);
    return new NextResponse("Error", { status: 404 });
  }
}
