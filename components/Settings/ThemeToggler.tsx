import { useTheme } from "next-themes";
import Sun from "@/assets/icons/Sun";
import Moon from "@/assets/icons/Moon";

export default function ThemeToggler() {
  const { setTheme, resolvedTheme } = useTheme();

  function onThemeChange() {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }

  return (
    <button
      type="button"
      onClick={onThemeChange}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors duration-150 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-neutral-200 dark:hover:bg-neutral-700/50"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" />
      )}
      <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}
