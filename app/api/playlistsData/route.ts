import { Playlist, PlaylistAPI } from "@/types";
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

    // Extract the data we need
    let newData = {
      items: data.items.map((item: PlaylistAPI) => {
        return {
          id: item.id,
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails,
        };
      }),
    };

    return NextResponse.json(newData);
  } catch (e) {
    console.log("Error in /api/playlistsData", e);
    return new NextResponse("Error", { status: 400 });
  }
}
