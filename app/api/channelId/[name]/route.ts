import { NextResponse } from "next/server";
import { apiErrorResponse, MAX_ID_LENGTH, requireItemsArray, youtubeApiFetch } from "@/utils/youtubeApi";

const CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]+$/;

type Params = {
  name: string;
};

export async function GET(req: Request, props: { params: Promise<Params> }): Promise<NextResponse> {
  try {
    const params = await props.params;
    const rawName = params.name;
    const name = typeof rawName === "string" ? rawName.trim() : rawName;

    if (typeof name !== "string" || name.length === 0 || name === "@" || name.length > MAX_ID_LENGTH) {
      return new NextResponse("Invalid Channel Name", { status: 400 });
    }

    if (CHANNEL_ID_PATTERN.test(name)) {
      return NextResponse.json("UU" + name.slice(2));
    }

    if (name.startsWith("@")) {
      const res = await youtubeApiFetch("channels", {
        part: "id",
        forHandle: name.slice(1),
      });
      const data = await res.json();
      const items = requireItemsArray(data);
      const channelId = (items[0] as { id?: unknown } | undefined)?.id;
      if (typeof channelId !== "string" || !CHANNEL_ID_PATTERN.test(channelId)) {
        return new NextResponse("No Channel Found", { status: 404 });
      }
      return NextResponse.json("UU" + channelId.slice(2));
    }

    const res = await youtubeApiFetch("search", {
      q: name,
      type: "channel",
      part: "id",
    });
    const data = await res.json();
    const items = requireItemsArray(data);
    const channelId = (items[0] as { id?: { channelId?: unknown } } | undefined)?.id?.channelId;
    if (typeof channelId !== "string" || !CHANNEL_ID_PATTERN.test(channelId)) {
      return new NextResponse("No Channel Found", { status: 404 });
    }
    return NextResponse.json("UU" + channelId.slice(2));
  } catch (e) {
    return apiErrorResponse(e, "/api/channelId/[name]");
  }
}
