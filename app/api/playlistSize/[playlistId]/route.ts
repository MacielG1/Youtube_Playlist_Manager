import { NextResponse } from "next/server";
import { apiErrorResponse, requireItemsArray, validateId, youtubeApiFetch } from "@/utils/youtubeApi";

type Params = {
  playlistId: string;
};

export async function GET(req: Request, props: { params: Promise<Params> }): Promise<NextResponse> {
  try {
    const params = await props.params;
    const playlistId = validateId(params.playlistId, "playlistId");

    const res = await youtubeApiFetch("playlists", {
      part: "contentDetails",
      id: playlistId,
    });

    const data = await res.json();
    const items = requireItemsArray(data);

    if (items.length === 0) {
      return new NextResponse("Playlist not found", { status: 404 });
    }

    const playlistLength = (items[0] as { contentDetails?: { itemCount?: number } })?.contentDetails?.itemCount;
    if (typeof playlistLength !== "number" || !Number.isInteger(playlistLength) || playlistLength < 0) {
      return new NextResponse("Unable to determine playlist size", { status: 404 });
    }

    return NextResponse.json(playlistLength, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } });
  } catch (e) {
    return apiErrorResponse(e, "/api/playlistSize/[playlistId]");
  }
}
