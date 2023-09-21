import { formatDescription } from "@/utils/formatDescription";

export default function Description({ description }: { description: string }) {
  return (
    <div className="my-5 max-w-[85vw] border-t border-gray-600 px-6 py-8 pt-10 text-sm text-neutral-400 xl:max-w-[72vw]">
      <p className="mb-2 flex flex-col gap-1">{formatDescription(description)}</p>
    </div>
  );
}
