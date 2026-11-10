import convertDurationTime from "@/utils/convertDurationTime";
import { NextResponse } from "next/server";
import { apiErrorResponse, parseIdList, readJsonBody, requireItemsArray, requireMetadataItem, youtubeApiFetch } from "@/utils/youtubeApi";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await readJsonBody(req);
    const ids = parseIdList(body.videosIds, "videosIds");

    const res = await youtubeApiFetch("videos", {
      part: "snippet,contentDetails",
      id: ids.join(","),
      maxResults: "50",
    });

    const data = await res.json();
    const items = requireItemsArray(data);

    const newData = {
      items: items.map((item) => {
        requireMetadataItem(item);
        return {
          id: item.id,
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails ?? {},
          description: item.snippet.description,
          duration: convertDurationTime(item.contentDetails?.duration ?? "PT0S"),
          channel: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
        };
      }),
    };

    return NextResponse.json(newData, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
  } catch (e) {
    return apiErrorResponse(e, "/api/videosData");
  }
}
