"use client";

import ArrowTop from "@/assets/icons/ArrowTop";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname !== "/") return null;

  return (
    <button
      className={`${
        isVisible ? "visible opacity-100" : "invisible opacity-0"
      } fixed bottom-12 right-14 z-50 rounded-full bg-indigo-900 p-2 text-white transition-opacity duration-300 ease-in-out focus:outline-none focus:ring-1 focus:ring-indigo-700`}
      onClick={handleClick}
    >
      <ArrowTop className="h-4 w-4" />
    </button>
  );
}
