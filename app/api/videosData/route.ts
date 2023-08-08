import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";
export async function POST(req: Request) {
  const { videosIds } = await req.json();

  if (!videosIds) return {};

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videosIds}&key=${API_KEY}&maxResults=50`);

    if (!res.ok) {
      console.log(`Error in /api/videosData`, res.status, res.statusText);
      return null;
    }

    const data = await res.json();

    if (!data) {
      console.log("Error", res.statusText);
      return {};
    }
    return NextResponse.json(data);
  } catch (e) {
    console.log("Error in /api/videosData");
    return new NextResponse("Error", { status: 404 });
  }
}
