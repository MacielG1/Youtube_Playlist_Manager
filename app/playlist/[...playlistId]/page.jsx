import YTPlaylistPlayer from "@/components/YTPlaylistPlayer";
export const runtime = "edge";
export default function page({ searchParams }) {
  return (
    <>
      <YTPlaylistPlayer params={searchParams} />
    </>
  );
}

export async function generateMetadata({ params, searchParams }) {
  return {
    title: searchParams.title,
  };
}
