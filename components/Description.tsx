import React, { useState } from "react";
import Link from "next/link";
import { Icons } from "@/assets/Icons";

export default function Description({ description }: { description: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const lines = description.split("\n");
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  function toggleAccordion() {
    if (isAccordionOpen) {
      window.scrollTo({ top: 0, behavior: "instant" });
    } else if (window.innerWidth > 1280) {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      }, 1);
    }
    setIsAccordionOpen((prev) => !prev);
  }

  return (
    <div className={`flex w-[85vw] max-w-[85vw] flex-col justify-center px-8 py-3 text-sm text-neutral-400 sm:justify-start xl:w-[68vw] xl:max-w-[68vw]`}>
      <div className="mb-2">
        <button onClick={toggleAccordion} className="flex items-center text-white transition-colors duration-300 hover:text-neutral-300 focus:outline-none md:pl-4">
          Description {isAccordionOpen ? <Icons.arrowUp className="h-4 w-4 " /> : <Icons.arrowDown className="h-4 w-4 " />}
        </button>
      </div>
      {isAccordionOpen && (
        <div className="flex flex-col gap-1 py-7 pt-2 ">
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
        </div>
      )}
    </div>
  );
}
