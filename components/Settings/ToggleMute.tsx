import { useAudioToggle } from "@/providers/SettingsProvider";
import { Switch } from "../Switch";
import { useMediaQuery } from "usehooks-ts";

export default function ToggleMute() {
  const { isAudioMuted, setIsAudioMuted } = useAudioToggle();
  const isMobile = useMediaQuery("(max-width: 640px)");

  function handleToggle() {
    setIsAudioMuted((prev) => !prev);
    localStorage.setItem("isAudioMuted", JSON.stringify(!isAudioMuted));
  }

  if (!isMobile) return null;

  return (
    <div className="flex w-full items-center justify-between rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-3">
        <svg className="h-4 w-4 text-neutral-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Mute Audio</span>
      </div>
      <Switch checked={isAudioMuted} onCheckedChange={handleToggle} />
    </div>
  );
}
