import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";

export async function POST(req) {
  let { playlistsIds } = await req.json();
  if (!playlistsIds) return;

  console.log("Fetching playlists data");
  let res = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistsIds}&key=${API_KEY}&maxResults=50`);

  if (!res.ok) {
    console.log(`Error: ${res.status}, ${res.statusText}`);
    return {};
  }

  let data = await res.json();
  console.log(data.kind);
  if (!data) {
    console.log("Error", res.statusText);
    return {};
  }
  console.log("data", data);
  return NextResponse.json(data);
}
