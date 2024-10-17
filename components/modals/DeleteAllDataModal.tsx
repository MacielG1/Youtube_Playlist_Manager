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
        <Button className="max-w-[9rem] whitespace-nowrap border border-neutral-950 px-[4rem]">Delete Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <div className="mx-auto flex max-w-[18rem] flex-col items-center justify-center gap-4 px-8 pb-6 pt-2 xs:max-w-sm sm:max-w-lg md:min-w-[18rem] lg:min-w-[25rem]">
          <DialogTitle className="text-lg font-semibold tracking-wide text-red-600 dark:text-red-500 sm:text-2xl">Delete All Saved Data</DialogTitle>
          <h3 className="max-h-[50vh] max-w-full overflow-auto break-words pt-2 text-center text-sm font-semibold text-neutral-800 dark:text-neutral-400 sm:text-lg">
            This will remove all of your saved Playlists and Videos stored in here
          </h3>

          <div className="flex gap-3 pt-3 text-lg">
            <DialogClose
              onClick={closeSettingsModal}
              className="shadow-xs cursor-pointer rounded-xl bg-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-700"
            >
              Cancel
            </DialogClose>
            <DialogClose
              onClick={deleteAllData}
              className="shadow-xs cursor-pointer rounded-xl bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-red-600 hover:ring-2 hover:ring-red-700"
            >
              Delete All
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
