import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";
export async function POST(req) {
  let { videosIds } = await req.json();

  if (!videosIds) return {};

  try {
    let res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videosIds}&key=${API_KEY}&maxResults=50`);

    if (!res.ok) {
      console.log(`Error in /api/videosData`, res.status, res.statusText);
      return null;
    }

    let data = await res.json();
    console.log("kind videos ", data.kind);
    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }
    return NextResponse.json(data);
  } catch (e) {
    console.log("Error in /api/videosData", e.status, e.statusText);
    return new NextResponse("Error", { status: 404 });
  }
}
