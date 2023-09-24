// import React, { useState } from "react";
// type Props = {
//   text: string;
//   children: React.ReactNode;
// };

// export default function Tooltip({ text, children }: Props) {
//   const [isVisible, setIsVisible] = useState(false);

//   const showTooltip = () => {
//     setIsVisible(true);
//   };

//   const hideTooltip = () => {
//     setIsVisible(false);
//   };

//   return (
//     <div className="relative inline-block ">
//       <div onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
//         {children}
//       </div>
//       {isVisible && (
//         <div className="absolute bottom-[120%] left-1/2 z-10 mt-5 -translate-x-1/2 transform whitespace-nowrap rounded bg-neutral-800 p-1 py-2 text-sm text-white shadow-md">
//           {text}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useRef } from "react";

type Props = {
  text: string;
  children: React.ReactNode;
};

export default function Tooltip({ text, children }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const hoverTimeout = useRef<number | null>(null);

  const showTooltip = () => {
    hoverTimeout.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 500);
  };

  const hideTooltip = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-[120%] left-1/2 z-10 mt-5 -translate-x-1/2 transform whitespace-nowrap rounded bg-neutral-200 p-1 py-2 text-sm font-medium text-black shadow-md dark:bg-neutral-800 dark:font-normal dark:text-white">
          {text}
        </div>
      )}
    </div>
  );
}
