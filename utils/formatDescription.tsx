import Link from "next/link";

export function formatDescription(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split("\n").map((line, index) => (
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
  ));
}
