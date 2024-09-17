import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../Dialog";

type ModalSettingsProps = {
  button: React.ReactNode;
  deleteText: string;
  type: "Playlist" | "Video";
  title: string;
  id?: string;

  onDelete: (id?: string) => void;
  isLoading?: boolean;
};

export default function ItemModalDelete({ button, deleteText, type, title, id, onDelete, isLoading = false }: ModalSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpenModal() {
    setIsOpen((prev) => !prev);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenModal}>
      <DialogTrigger asChild>{button}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="mx-auto flex max-w-[18rem] flex-col items-center justify-center gap-4 px-8 pb-6 pt-2 xs:max-w-sm sm:max-w-lg md:min-w-[18rem] lg:min-w-[25rem]">
          <DialogTitle className="text-lg font-semibold tracking-wide text-red-600 dark:text-red-500 sm:text-2xl">
            {deleteText} {type}
          </DialogTitle>
          <h3 className="max-h-[50vh] max-w-full overflow-auto break-words pt-2 text-center text-sm font-semibold text-neutral-800 dark:text-neutral-400 sm:text-lg">
            {title}
          </h3>

          <div className="flex gap-3 pt-3 text-lg">
            <DialogClose asChild>
              <button
                onClick={handleOpenModal}
                disabled={isLoading}
                className="shadow-xs cursor-pointer rounded-xl bg-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-700"
              >
                Cancel
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button
                onClick={() => onDelete(id)}
                disabled={isLoading}
                className="shadow-xs cursor-pointer rounded-xl bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-red-600 hover:ring-2 hover:ring-red-700"
              >
                {deleteText}
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
