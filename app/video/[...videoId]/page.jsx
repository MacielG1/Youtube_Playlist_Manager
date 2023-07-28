import YTVideoPlayer from "@/components/YTVideoPlayer";
export const runtime = "edge";
export default function page({ searchParams }) {
  return (
    <>
      <YTVideoPlayer params={searchParams} />
    </>
  );
}

export async function generateMetadata({ params, searchParams }) {
  // const playlistsIds = allPlaylists.join(",");
  // read route params
  console.log("params", searchParams);
  // console.log("parent", await parent);
  return {
    title: searchParams.title,
  };
}
