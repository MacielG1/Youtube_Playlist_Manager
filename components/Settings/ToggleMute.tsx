import React, { useEffect, useState } from "react";
import { Switch } from "../UI/Switch";

export default function ToggleMute() {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const isAudioMuted = JSON.parse(localStorage.getItem("isAudioMuted") || "false");
    setIsChecked(isAudioMuted);
  }, []);

  function handleToggle() {
    setIsChecked((prev) => !prev);
    localStorage.setItem("isAudioMuted", JSON.stringify(!isChecked));
  }

  return (
    <p className="flex items-center justify-center gap-x-2 pt-2 text-lg">
      <Switch checked={isChecked} onCheckedChange={handleToggle} />
      <span>Mute Audio</span>
    </p>
  );
}
