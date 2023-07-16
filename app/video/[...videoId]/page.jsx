import YTVideoPlayer from "@/components/YTVideoPlayer";
export const runtime = "edge";
export default function page({ searchParams }) {
  return (
    <>
      <YTVideoPlayer params={searchParams} />
    </>
  );
}
