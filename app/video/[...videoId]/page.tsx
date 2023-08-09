import YTVideoPlayer from "@/components/YTVideoPlayer";
export const runtime = "edge";

type searchParams = {
  v: string;
  title: string;
};

export default function page({ searchParams }: { searchParams: searchParams }) {
  return (
    <>
      <YTVideoPlayer params={searchParams} />
    </>
  );
}

export async function generateMetadata({ searchParams }: { searchParams: searchParams }) {
  return {
    title: searchParams.title,
  };
}
