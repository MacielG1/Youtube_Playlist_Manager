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
        <Button className="max-w-[144px] cursor-pointer border border-neutral-950 px-[64px] whitespace-nowrap">Delete Data</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <div className="xs:max-w-sm mx-auto flex max-w-[288px] flex-col items-center justify-center gap-4 px-8 pt-2 pb-6 sm:max-w-lg md:min-w-[288px] lg:min-w-[400px]">
          <DialogTitle className="text-lg font-semibold tracking-wide text-red-600 sm:text-2xl dark:text-red-500">Delete All Saved Data</DialogTitle>
          <h3 className="max-h-[50vh] max-w-full overflow-auto pt-2 text-center text-sm font-semibold break-words text-neutral-800 sm:text-lg dark:text-neutral-400">
            This will remove all of your saved Playlists and Videos stored in here
          </h3>

          <div className="flex gap-3 pt-3 text-lg">
            <DialogClose
              onClick={closeSettingsModal}
              className="ring-offset-background cursor-pointer rounded-xl bg-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-2xs ring-offset-2 transition-all duration-300 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-700"
            >
              Cancel
            </DialogClose>
            <DialogClose
              onClick={deleteAllData}
              className="ring-offset-background cursor-pointer rounded-xl bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-2xs ring-offset-2 transition-all duration-300 hover:bg-red-600 hover:ring-2 hover:ring-red-700"
            >
              Delete All
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
