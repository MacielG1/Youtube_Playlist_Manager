import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";

export async function GET(req, { params }) {
  const name = params.name;

  console.log("name", name);
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${encodeURIComponent(name)}&type=channel&part=id`);

  if (!res.ok) {
    console.log("Error in /api/channelId/[name]", res.status, res.statusText);
    return {};
  }

  let data = await res.json();
  if (!data) {
    console.log("No Data", res.statusText);
    return {};
  }

  let channelId = data?.items[0]?.id?.channelId;
  let playlistId = channelId.replace("UC", "UU");

  return NextResponse.json(playlistId);
}
