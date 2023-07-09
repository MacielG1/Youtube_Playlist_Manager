import YTPlaylistPlayer from "@/components/YTPlaylistPlayer";

export default function page({ searchParams }) {
  console.log(searchParams);
  return (
    <>
      <YTPlaylistPlayer params={searchParams} />
    </>
  );
}
