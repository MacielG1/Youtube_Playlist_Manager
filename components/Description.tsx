import React, { useState } from "react";
import Link from "next/link";
import { Icons } from "@/assets/Icons";
import { cn } from "@/utils/cn";

type Props = {
  description: string;
  className?: string;
};

export default function Description({ description, className }: Props) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = description.split("\n");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  function toggleAccordion() {
    if (isAccordionOpen) {
      window.scrollTo({ top: 0, behavior: "instant" });
    } else if (window.innerWidth > 1280) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 1);
    }
    setIsAccordionOpen((prev) => !prev);
  }

  return (
    <div className={cn(`flex w-[85vw] max-w-[85vw] flex-col justify-center px-8 py-3 text-sm text-neutral-400 sm:justify-start xl:w-[68vw] xl:max-w-[68vw]`, className)}>
      <div className="mb-2">
        <button
          onClick={toggleAccordion}
          className="flex items-center text-base text-neutral-700 transition-colors duration-300 hover:text-neutral-950 focus:outline-none dark:text-white dark:hover:text-neutral-300 md:pl-4"
        >
          Description
          {isAccordionOpen ? (
            <Icons.arrowUp className="ml-1 h-4 w-4 fill-neutral-200 text-neutral-800   dark:fill-neutral-800 dark:text-white " />
          ) : (
            <Icons.arrowDown className="ml-1 h-4 w-4 fill-neutral-200 text-neutral-800   dark:fill-neutral-800 dark:text-white " />
          )}
        </button>
      </div>
      {isAccordionOpen && (
        <div className="flex flex-col gap-1 pb-10 pt-2 ">
          {lines.map((line, index) => (
            <span key={index} className="text-sm md:text-base">
              {line.split(urlRegex).map((part, i) =>
                part.match(urlRegex) ? (
                  <Link key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {part}
                  </Link>
                ) : (
                  <span key={i} className=" text-neutral-900 dark:text-neutral-200">
                    {part}
                  </span>
                ),
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
