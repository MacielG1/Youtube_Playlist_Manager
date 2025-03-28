import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../Dialog";

type ModalSettingsProps = {
  icon: React.ReactNode;
  deleteText: string;
  extraText?: string;
  type: "Playlist" | "Video";
  title: string;
  id?: string;
  handleVideoPlayback: (play: "play" | "pause") => void;
  isVideoPaused: () => Promise<boolean>;
  onDelete: (id?: string) => void;
  isLoading?: boolean;
};

export default function ModalDelete({
  icon,
  deleteText,
  type,
  title,
  id,
  extraText,
  handleVideoPlayback,
  isVideoPaused,
  onDelete,
  isLoading = false,
}: ModalSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [wasPausedByModal, setWasPausedByModal] = useState(false);

  function handleOpenModal() {
    setIsOpen((prev) => !prev);
  }

  async function handlePauseVideo() {
    if (!(await isVideoPaused())) {
      handleVideoPlayback("pause");
      setWasPausedByModal(true);
    }
  }

  useEffect(() => {
    if (!isOpen && wasPausedByModal) {
      handleVideoPlayback("play");
      setWasPausedByModal(false);
    }
  }, [isOpen]);

  async function handleDelete() {
    setWasPausedByModal(false);
    await onDelete(id);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenModal}>
      <DialogTrigger asChild>
        <span
          onClick={handlePauseVideo}
          className="cursor-pointer text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
          role="button"
        >
          {icon}
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <div className="mx-auto flex max-w-[288px] flex-col items-center justify-center gap-4 px-8 pb-6 pt-2 xs:max-w-sm sm:max-w-lg md:min-w-[288px] lg:min-w-[400px]">
          <DialogTitle className="text-lg font-semibold text-balance tracking-wide text-red-600 dark:text-red-500 sm:text-2xl">
            {deleteText} {type} {extraText}
          </DialogTitle>
          <h3 className="max-h-[50vh] max-w-full overflow-auto break-words pt-2 text-center text-sm font-semibold text-neutral-800 dark:text-neutral-400 sm:text-lg">
            {title}
          </h3>

          <div className="flex gap-3 pt-3 text-lg">
            <DialogClose
              onClick={() => {
                if (wasPausedByModal) {
                  handleVideoPlayback("play");
                  setWasPausedByModal(false);
                }
              }}
              disabled={isLoading}
              className="shadow-2xs cursor-pointer rounded-xl bg-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-700"
            >
              Cancel
            </DialogClose>
            <DialogClose
              onClick={handleDelete}
              disabled={isLoading}
              className="shadow-2xs cursor-pointer rounded-xl bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-red-600 hover:ring-2 hover:ring-red-700"
            >
              {deleteText}
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
