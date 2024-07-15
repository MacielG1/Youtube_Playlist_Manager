export default function VideoDate({ publishedAt }: { publishedAt: string }) {
  const date = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  return <div className="pt-2 text-sm text-neutral-500 dark:text-neutral-400 md:pl-4 md:pt-0.5">{date}</div>;
}
