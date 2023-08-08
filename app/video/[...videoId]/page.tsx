import YTVideoPlayer from "@/components/YTVideoPlayer";
export const runtime = "edge";

type searchParams = {
  title: string;
  videoId: string;
};

export default function page({ searchParams }: { searchParams: searchParams }) {
  <>
    <YTVideoPlayer params={searchParams} />
  </>;
}

export async function generateMetadata({ searchParams }: { searchParams: searchParams }) {
  return {
    title: searchParams.title,
  };
}
