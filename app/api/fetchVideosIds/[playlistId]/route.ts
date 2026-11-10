import { Playlist } from "@/types";
import { NextResponse } from "next/server";
import { apiErrorResponse, requireItemsArray, requireMetadataItem, UpstreamMetadataItem, validateId, youtubeApiFetch, YouTubeApiError } from "@/utils/youtubeApi";

type Params = {
  playlistId: string;
};

const MAX_AMOUNT_OF_PAGES = 50;

export async function POST(req: Request, props: { params: Promise<Params> }): Promise<NextResponse> {
  try {
    const params = await props.params;
    const playlistsToFetch = validateId(params.playlistId, "playlistId");

    let pagesCounter = 0;
    let nextPageToken = "";
    const seenPageTokens = new Set<string>();

    const allVideos: UpstreamMetadataItem[] = [];

    do {
      if (nextPageToken) {
        if (seenPageTokens.has(nextPageToken)) {
          throw new YouTubeApiError(502, "Upstream pagination error");
        }
        seenPageTokens.add(nextPageToken);
      }

      const res = await youtubeApiFetch("playlistItems", {
        part: "snippet",
        playlistId: playlistsToFetch,
        maxResults: "50",
        pageToken: nextPageToken,
      });

      const data = await res.json();
      const items = requireItemsArray(data);

      if (items.length === 0) {
        nextPageToken = "";
        break;
      }

      for (const item of items) {
        requireMetadataItem(item);
        allVideos.push(item);
      }
      nextPageToken = typeof data.nextPageToken === "string" ? data.nextPageToken : "";
      pagesCounter++;
    } while (nextPageToken && pagesCounter < MAX_AMOUNT_OF_PAGES);

    if (nextPageToken) {
      throw new YouTubeApiError(422, "Playlist exceeds maximum page limit");
    }

    let newData: Playlist[] = [];

    allVideos.forEach((item) => {
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

    return NextResponse.json(newData, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (e) {
    return apiErrorResponse(e, "/api/fetchVideosIds/[playlistId]");
  }
}
