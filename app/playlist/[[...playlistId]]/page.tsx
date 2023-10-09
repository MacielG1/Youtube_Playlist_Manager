import YTPlaylistPlayer from "@/components/YTPlaylistPlayer";
export const runtime = "edge";

type searchParams = {
  list: string;
  title: string;
};

export default function page({ searchParams }: { searchParams: searchParams }) {
  return <YTPlaylistPlayer params={searchParams} />;
}

export async function generateMetadata({ searchParams }: { searchParams: searchParams }) {
  return {
    title: searchParams.title,
  };
}
