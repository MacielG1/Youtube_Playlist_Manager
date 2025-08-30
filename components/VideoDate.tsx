export default function VideoDate({ publishedAt }: { publishedAt: string }) {
  const date = new Date(publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  return <span className="text-sm text-neutral-500 dark:text-neutral-400">{date}</span>;
}
