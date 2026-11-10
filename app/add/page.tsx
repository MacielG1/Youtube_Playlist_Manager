import AddExternalItem from "@/components/AddExternalItem";
import Link from "next/link";

type searchParams = {
  type?: string | string[];
  id?: string | string[];
};

const ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const CHANNEL_NAME_PATTERN = /^[^\s]{1,100}$/;
const VALID_TYPES = new Set(["video", "playlist", "channel"]);

function scalar(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function page(props: { searchParams: Promise<searchParams> }) {
  const searchParams = await props.searchParams;
  const type = scalar(searchParams.type);
  const id = scalar(searchParams.id);

  const idValid = id !== undefined && (type === "channel" ? CHANNEL_NAME_PATTERN.test(id) : ID_PATTERN.test(id));
  if (!type || !VALID_TYPES.has(type) || !idValid) {
    return (
      <div className="flex flex-col items-center gap-3 pt-10">
        <h3 className="text-lg font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">Invalid Add Link</h3>
        <Link
          href="/"
          className="my-5 inline-flex items-center justify-center rounded-md border border-neutral-800 bg-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:border-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return <AddExternalItem searchParams={{ type, id: id as string }} />;
}
