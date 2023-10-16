import { useState, useEffect } from "react";

// Custom hook to track window width
export default function useWindowWidth() {
  if (typeof window === "undefined") return 0;
  const [windowWidth, setWindowWidth] = useState(window?.innerWidth);

  useEffect(() => {
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", updateWindowWidth);

    return () => {
      window.removeEventListener("resize", updateWindowWidth);
    };
  }, []);

  return windowWidth;
}
