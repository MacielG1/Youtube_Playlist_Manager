import { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Sun from "@assets/sun.svg";
import Moon from "@assets/moon.svg";

export default function ThemeToggler() {
  const [isOpen, setIsOpen] = useState(false);

  const { setTheme, theme, resolvedTheme } = useTheme();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  function onThemeChange() {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  return (
    <div className=" relative inline-block text-center w-24 px-4 py-2">
      <button type="button" onClick={toggleDropdown} className=" text-white rounded-md focus:outline-none">
        <Image
          src={resolvedTheme === "dark" ? Sun : Moon}
          alt="Theme"
          className="inline-block w-5 h-5 min-w-[1.3rem]"
          style={{ width: "auto", height: "auto" }}
          unoptimized
          priority
          onClick={onThemeChange}
        />
        {/* screen reader */}
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
}
