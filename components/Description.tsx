// import Link from "next/link";

// export default function Description({ description }: { description: string }) {
//   const urlRegex = /(https?:\/\/[^\s]+)/g;
//   const lines = description.split("\n");

//   return (
//     <div className="my-5 max-w-[85vw]  px-6 py-7 text-sm text-neutral-400 xl:max-w-[72vw]">
//       <p className="mb-2 flex flex-col gap-1">
//         {lines.map((line, index) => (
//           <span key={index} className="text-sm md:text-base">
//             {line.split(urlRegex).map((part, i) =>
//               part.match(urlRegex) ? (
//                 <Link key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//                   {part}
//                 </Link>
//               ) : (
//                 <span key={i} className=" text-neutral-200">
//                   {part}
//                 </span>
//               ),
//             )}
//           </span>
//         ))}
//       </p>
//     </div>
//   );
// }

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
    } else {
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
      }, 1);
    }
    setIsAccordionOpen((prev) => !prev);
  }

  return (
    <div className={`my-1 w-[85vw] max-w-[85vw] px-6 py-5 text-sm text-neutral-400 xl:w-[72vw] xl:max-w-[72vw] `}>
      <div className="mb-2">
        <button onClick={toggleAccordion} className="flex items-center pl-4 text-white transition-colors duration-300 hover:text-neutral-300 focus:outline-none">
          Description {isAccordionOpen ? <Icons.arrowUp className="h-4 w-4 " /> : <Icons.arrowDown className="h-4 w-4 " />}
        </button>
      </div>
      {isAccordionOpen && (
        <div className="flex flex-col gap-1 py-7 pt-2">
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
