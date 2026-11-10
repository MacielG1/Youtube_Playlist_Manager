import YTPlaylistPlayer from "@/components/YTPlaylistPlayer";
import Link from "next/link";

type searchParams = {
  list?: string | string[];
  title?: string | string[];
};

const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

function scalar(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function page(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  const list = scalar(searchParams.list);
  const title = scalar(searchParams.title) ?? "Playlist";

  if (!list || !ID_PATTERN.test(list)) {
    return (
      <div className="flex flex-col items-center gap-3 pt-10">
        <h3 className="text-lg font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">Invalid Playlist Link</h3>
        <Link
          href="/"
          className="my-5 inline-flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:border-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return <YTPlaylistPlayer key={list} params={{ list, title }} />;
}

export async function generateMetadata(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  return {
    title: scalar(searchParams.title) ?? "Playlist",
  };
}
