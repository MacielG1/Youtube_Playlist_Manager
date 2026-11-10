import { NextResponse } from "next/server";
import { apiErrorResponse, parseIdList, readJsonBody, requireItemsArray, requireMetadataItem, youtubeApiFetch } from "@/utils/youtubeApi";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await readJsonBody(req);
    const ids = parseIdList(body.playlistsIds, "playlistsIds");

    const res = await youtubeApiFetch("playlists", {
      part: "snippet",
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
        };
      }),
    };

    return NextResponse.json(newData, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
  } catch (e) {
    return apiErrorResponse(e, "/api/playlistsData");
  }
}
