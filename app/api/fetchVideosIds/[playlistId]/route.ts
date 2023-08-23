// import { NextResponse } from "next/server";

// const API_KEY = process.env.YOUTUBE_API;
// export const runtime = "edge";

// type Params = {
//   playlistId: string;
// };

// export async function POST(req: Request, { params }: { params: Params }) {
//   let { existingVideoIds } = await req.json();

//   const playlistsToFetch = params.playlistId;

//   if (!playlistsToFetch) return;

//   let nextPageToken = "";
//   let videos = [];

//   const newExistingVideoIds = existingVideoIds.toReversed();

//   console.log("newExistingVideoIds", newExistingVideoIds);

//   try {
//     do {
//       const res = await fetch(
//         `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistsToFetch}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
//       );
//       if (!res.ok) {
//         console.log("Error in /api/fetch_write_videos/[playlistId]", res.status, res.statusText);

//         throw new Error("ERROR");
//       }
//       let data = await res.json();

//       console.log(data.items[0].snippet.resourceId.videoId);

//       let foundDuplicate = false;

//       for (let item of data.items) {
//         const videoId = item.snippet.resourceId.videoId;

//         if (newExistingVideoIds.includes(videoId)) {
//           console.log("DUPLICATE VIDEO", videoId);
//           foundDuplicate = true;
//           break; // Stop the loop if a duplicate video is found
//         }

//         videos.push(videoId);
//       }
//       if (foundDuplicate) {
//         break;
//       }

//       nextPageToken = data.nextPageToken;
//     } while (nextPageToken);
//     console.log("New videos", videos);
//     return NextResponse.json([...existingVideoIds, ...videos]);
//   } catch (e) {
//     console.log("Error in /api/fetch_write_videos/[playlistId]");
//     return new NextResponse("Error", { status: 404 });
//   }
// }

import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API;
export const runtime = "edge";

type Params = {
  playlistId: string;
};

export async function POST(req: Request, { params }: { params: Params }) {
  // let { existingVideoIds } = await req.json();
  // const newExistingVideoIds = existingVideoIds.toReversed();

  const playlistsToFetch = params.playlistId;

  if (!playlistsToFetch) return;

  let nextPageToken = "";

  const allIds = [];
  try {
    do {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${playlistsToFetch}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`
      );
      if (!res.ok) {
        console.log("Error in /api/fetchVideosIds/[playlistId]", res.status, res.statusText);
        throw new Error("ERROR");
      }
      let data = await res.json();

      for (let item of data.items) {
        allIds.push(item.contentDetails.videoId);
      }

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return NextResponse.json(allIds);
  } catch (e: any) {
    console.log("Error in /api/fetch_write_videos/[playlistId]", e.message);
    return new NextResponse("Error", { status: 404 });
  }
}
