import { Switch } from "../UI/Switch";
import { useAudioToggle } from "@/providers/SettingsProvider";

export default function ToggleMute() {
  const { isAudioMuted, setIsAudioMuted } = useAudioToggle();

  function handleToggle() {
    setIsAudioMuted((prev) => !prev);
    localStorage.setItem("isAudioMuted", JSON.stringify(!isAudioMuted));
  }

  return (
    <p className="flex items-center justify-center gap-x-2 pt-2 text-base">
      <Switch checked={isAudioMuted} onCheckedChange={handleToggle} />
      <span>Mute Audio</span>
    </p>
  );
}
