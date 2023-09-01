import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";

export async function POST(req: Request) {
  const { playlistsIds } = await req.json();

  if (!playlistsIds) return {};

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistsIds}&key=${API_KEY}&maxResults=50`);

    if (!res.ok) {
      console.log(`Error in /api/playlistsData`, res.status, res.statusText);
      return {};
    }

    const data = await res.json();

    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }
    return NextResponse.json(data);
  } catch (e) {
    console.log("Error in /api/playlistsData", e);
    return new NextResponse("Error", { status: 400 });
  }
}
