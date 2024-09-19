import { Playlist, PlaylistAPI } from "@/types";
import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;

type Params = {
  playlistId: string;
};

let MAX_AMOUNT_OF_PAGES = 50;

export async function POST(req: Request, { params }: { params: Params }): Promise<NextResponse> {
  const playlistsToFetch = params.playlistId;

  if (!playlistsToFetch) return new NextResponse("No Playlist Id", { status: 404 });

  let nextPageToken = "";
  const allVideos = [];

  try {
    const fetchPage = async (pageToken: string) => {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistsToFetch}&maxResults=50&pageToken=${pageToken}&key=${API_KEY}`,
      );
      if (!res.ok) {
        console.log("Error in /api/fetchVideosIds/[playlistId]", res.status, res.statusText);
        throw new Error("ERROR");
      }
      return res.json();
    };

    let data = await fetchPage(nextPageToken);
    allVideos.push(...data.items);
    nextPageToken = data.nextPageToken;

    const fetchPromises = [];
    let pagesCounter = 1;

    while (nextPageToken && pagesCounter < MAX_AMOUNT_OF_PAGES) {
      fetchPromises.push(fetchPage(nextPageToken));
      pagesCounter++;
      nextPageToken = data.nextPageToken;
    }

    const results = await Promise.all(fetchPromises);
    results.forEach((result) => {
      allVideos.push(...result.items);
    });

    let newData: Playlist[] = [];

    allVideos.forEach((item: PlaylistAPI) => {
      const title = item.snippet.title;

      if (title !== "Private video" && title !== "Deleted video" && item.snippet.resourceId?.videoId) {
        newData.push({
          id: item.snippet.resourceId.videoId,
          title: title,
          thumbnails: item.snippet.thumbnails || {},
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
        });
      }
    });

    return NextResponse.json(newData);
  } catch (e) {
    console.log("Error in /api/fetch_write_videos/[playlistId]", e);
    return new NextResponse("Error", { status: 404 });
  }
}
