import Link from "next/link";

export default function Description({ description }: { description: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = description.split("\n");

  return (
    <div className="my-5 max-w-[85vw] border-t border-gray-600 px-6 py-8 pt-10 text-sm text-neutral-400 xl:max-w-[72vw]">
      <p className="mb-2 flex flex-col gap-1">
        {lines.map((line, index) => (
          <span key={index} className="text-sm md:text-base">
            {line.split(urlRegex).map((part, i) =>
              part.match(urlRegex) ? (
                <Link key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {part}
                </Link>
              ) : (
                <span key={i} className=" text-neutral-200">
                  {part}
                </span>
              ),
            )}
          </span>
        ))}
      </p>
    </div>
  );
}
