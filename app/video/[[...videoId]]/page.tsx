import YTVideoPlayer from "@/components/YTVideoPlayer";
export const runtime = "edge";

type searchParams = {
  v: string;
  title: string;
};

export default async function page(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  return <YTVideoPlayer params={searchParams} />;
}

export async function generateMetadata(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  let decodedTitled;
  try {
    decodedTitled = decodeURIComponent(searchParams.title);
  } catch {
    decodedTitled = searchParams.title;
  }

  return {
    title: decodedTitled,
  };
}
