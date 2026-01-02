import Link from "next/link";

export default function SupportButton() {
  return (
    <Link
      target="_blank"
      rel="noopener noreferrer"
      href="https://www.buymeacoffee.com/macielg1"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-neutral-200 dark:hover:bg-neutral-700/50"
    >
      <svg className="h-4 w-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span>Support Me</span>
    </Link>
  );
}
