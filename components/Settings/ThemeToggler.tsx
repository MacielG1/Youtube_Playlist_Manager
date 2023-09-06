import { useState } from "react";
import { useTheme } from "next-themes";
import { Icons } from "@/assets/Icons";

export default function ThemeToggler() {
  const [isOpen, setIsOpen] = useState(false);

  const { setTheme, resolvedTheme } = useTheme();

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
    <div className=" relative inline-block w-24 px-4 py-2 text-center">
      <button
        type="button"
        onClick={toggleDropdown}
        className=" rounded-md text-white transition duration-300 hover:scale-110 focus:outline-none"
      >
        <span onClick={onThemeChange}>
          {resolvedTheme === "dark" ? (
            <Icons.sun className="h-6 w-6 text-yellow-400 " />
          ) : (
            <Icons.moon className="h-6 w-6 text-gray-800 " />
          )}
        </span>
        {/* screen reader */}
        <span className="sr-only">Toggle Theme</span>
      </button>
    </div>
  );
}
