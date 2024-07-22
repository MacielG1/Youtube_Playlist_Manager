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

  if (!isMobile) return null; // Displays only on mobile to enable video playback in the background while other media is playing

  return (
    <p className="flex items-center justify-center gap-x-2 pt-2 text-base">
      <Switch checked={isAudioMuted} onCheckedChange={handleToggle} />
      <span>Mute Audio</span>
    </p>
  );
}
