"use client";

import { useEffect, useRef } from "react";

export const PROGRESS_SAVE_INTERVAL_MS = 5_000;

export default function useProgressSaver(save: (flush: boolean) => void | Promise<void>): void {
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  useEffect(() => {
    const invoke = (flush: boolean) => {
      try {
        void Promise.resolve(saveRef.current(flush)).catch(() => {});
      } catch {
        /* synchronous save throw, ignore */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") invoke(true);
    };
    const onPageHide = () => invoke(true);

    const timer = setInterval(() => invoke(false), PROGRESS_SAVE_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      invoke(true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      clearInterval(timer);
    };
  }, []);
}
