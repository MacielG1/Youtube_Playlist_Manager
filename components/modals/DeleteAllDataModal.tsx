import { useQueryClient } from "@tanstack/react-query";
import { clear } from "idb-keyval";
import { useRouter } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../Dialog";
import Button from "@/components/Button";
import { useState } from "react";
import useIsExportable from "@/hooks/useIsExportable";

type Props = {
  closeSettingsModal: () => void;
};

export default function DeleteAllDataModal({ closeSettingsModal }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  const isExportable = useIsExportable();

  if (!isExportable) return null;

  async function deleteAllData() {
    localStorage.removeItem("playlists");
    localStorage.removeItem("videos");

    const allKeys = Object.keys(localStorage);
    const keysToRemove = ["pl=", "v=", "plVideos="];

    allKeys.forEach((key) => {
      if (keysToRemove.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });

    await clear();
    queryClient.clear();
    closeSettingsModal();
    router.push("/", { scroll: false });
    router.refresh();
  }
  function handleOpenModal() {
    setIsOpen((prev) => !prev);
  }
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenModal}>
      <DialogTrigger asChild>
        <button className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400 dark:hover:bg-red-950/30">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete Data</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[340px] sm:max-w-[400px]" aria-describedby={undefined}>
        <div className="flex flex-col items-center gap-4 px-2 pt-2 pb-2">
          {/* Warning Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="text-center">
            <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Delete All Data</DialogTitle>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              This will remove all your saved playlists and videos.
            </p>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <DialogClose
              onClick={closeSettingsModal}
              className="flex-1 cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-150 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
            >
              Cancel
            </DialogClose>
            <DialogClose
              onClick={deleteAllData}
              className="flex-1 cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete All
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
