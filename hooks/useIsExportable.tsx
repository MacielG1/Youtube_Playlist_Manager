import { useState, useEffect } from "react";

export default function useIsExportable() {
  const [isExportable, setIsExportable] = useState(false);

  useEffect(() => {
    const savedPlaylists = JSON.parse(localStorage.getItem("playlists") || "[]");
    const savedVideos = JSON.parse(localStorage.getItem("videos") || "[]");

    if (savedPlaylists.length > 0 || savedVideos.length > 0) {
      setIsExportable(true);
    } else {
      setIsExportable(false);
    }

    return () => {
      setIsExportable(false);
    };
  }, []);

  return isExportable;
}
