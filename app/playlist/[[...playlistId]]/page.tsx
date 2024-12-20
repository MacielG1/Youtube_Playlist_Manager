import YTPlaylistPlayer from "@/components/YTPlaylistPlayer";
export const runtime = "edge";

type searchParams = {
  list: string;
  title: string;
};

export default async function page(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  return <YTPlaylistPlayer params={searchParams} />;
}

export async function generateMetadata(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  return {
    title: searchParams.title,
  };
}
