import Link from "next/link";

type Props = {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HowItWorksButton({ setModalOpen }: Props) {
  return (
    <Link
      href="/about"
      onClick={() => setModalOpen(false)}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-neutral-200 dark:hover:bg-neutral-700/50"
    >
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
      <span>How it Works</span>
    </Link>
  );
}
