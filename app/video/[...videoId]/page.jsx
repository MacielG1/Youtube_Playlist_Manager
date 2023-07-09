import YTVideoPlayer from "@/components/YTVideoPlayer";

export default function page({ searchParams }) {
  return (
    <>
      <YTVideoPlayer params={searchParams} />
    </>
  );
}
