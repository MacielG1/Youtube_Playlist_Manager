import YTPlaylistPlayer from "@/components/YTPlaylistPlayer";

export default function page({ searchParams }) {
  console.log("params", searchParams);
  return (
    <>
      <YTPlaylistPlayer params={searchParams} />
    </>
  );
}
