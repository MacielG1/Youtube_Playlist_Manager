import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";
export async function POST(req) {
  let { videosIds } = await req.json();

  if (!videosIds) return;
  console.log("Fetching videos data");
  let res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videosIds}&key=${API_KEY}&maxResults=50`);
  let data = await res.json();
  console.log(data.kind);
  if (!data) {
    console.log("Error", res.statusText);
    return {};
  }
  return NextResponse.json(data);
}
