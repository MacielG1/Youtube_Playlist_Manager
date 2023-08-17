import { NextResponse } from "next/server";
const API_KEY = process.env.YOUTUBE_API;

export const runtime = "edge";

type Params = {
  name: string;
};

export async function GET(req: Request, response: Response, params: Params) {
  const name = params.name;

  if (!name) return;

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&q=${name}&type=channel&part=id`);

    if (!res.ok) {
      console.log("Error in /api/channelId/[name]", res.status, res.statusText);
      return new NextResponse("Error", { status: 404 });
    }

    const data = await res.json();

    if (!data) {
      console.log("No Data", res.statusText);
      return new NextResponse("No Data Found", { status: 404 });
    } else {
      let channelId = data?.items[0]?.id?.channelId;
      if (!channelId) {
        return new NextResponse("No Channel Found", { status: 404 });
      } else {
        const playlistId = channelId.replace("UC", "UU");
        return NextResponse.json(playlistId);
      }
    }
  } catch (e) {
    console.log(e);
    return new NextResponse("Error in Channel Id", { status: 404 });
  }
}
