import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;
export const runtime = "edge";
export async function GET(req, { params }) {
  const playlistId = params.playlistId;

  const res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=contentDetails&id=${playlistId}&key=${API_KEY}`);

  if (!res.ok) {
    console.log(`Error: ${res.status}, ${res.statusText}`);
    return;
  }
  let data = await res.json();
  let playlistLength = data.items[0].contentDetails.itemCount;

  return NextResponse.json(playlistLength);
}
