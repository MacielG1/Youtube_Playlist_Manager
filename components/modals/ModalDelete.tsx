import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../Dialog";
import toast from "react-hot-toast";
import { toastError } from "@/utils/toastStyles";

type ModalSettingsProps = {
  icon: React.ReactNode;
  deleteText: string;
  extraText?: string;
  type: "Playlist" | "Video";
  title: string;
  id?: string;
  handleVideoPlayback: (play: "play" | "pause") => void | Promise<void>;
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
  const wasPausedByModalRef = useRef(false);
  const pauseGenerationRef = useRef(0);
  const mountedRef = useRef(false);
  const openRef = useRef(false);
  const confirmedRef = useRef(false);

  const bumpPauseGeneration = useCallback(() => {
    pauseGenerationRef.current++;
  }, []);

  async function handlePauseVideo() {
    const generation = ++pauseGenerationRef.current;
    try {
      const paused = await isVideoPaused();
      if (generation !== pauseGenerationRef.current) return;
      if (paused) return;
      await handleVideoPlayback("pause");
      if (generation !== pauseGenerationRef.current) {
        if (mountedRef.current) {
          if (!openRef.current && !confirmedRef.current) {
            await Promise.resolve(handleVideoPlayback("play")).catch(() => {});
            return;
          }
          wasPausedByModalRef.current = true;
        }
        return;
      }
      wasPausedByModalRef.current = true;
    } catch (error) {
      console.error("Error pausing video:", error);
    }
  }

  useEffect(() => {
    if (!isOpen && wasPausedByModalRef.current) {
      void Promise.resolve(handleVideoPlayback("play")).catch(() => {});
      wasPausedByModalRef.current = false;
    }
  }, [isOpen, handleVideoPlayback]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      bumpPauseGeneration();
    };
  }, [bumpPauseGeneration]);

  function handleOpenChange(open: boolean) {
    openRef.current = open;
    if (open) confirmedRef.current = false;
    else pauseGenerationRef.current++;
    setIsOpen(open);
  }

  async function handleDelete() {
    confirmedRef.current = true;
    bumpPauseGeneration();
    wasPausedByModalRef.current = false;
    try {
      await onDelete(id);
      openRef.current = false;
      setIsOpen(false);
    } catch (error) {
      confirmedRef.current = false;
      console.error("Delete failed:", error);
      toast.error("Delete failed", toastError);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={handlePauseVideo}
          className="cursor-pointer text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          {icon}
        </button>
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
                if (wasPausedByModalRef.current) {
                  void Promise.resolve(handleVideoPlayback("play")).catch(() => {});
                  wasPausedByModalRef.current = false;
                }
              }}
              disabled={isLoading}
              className="shadow-2xs cursor-pointer rounded-xl bg-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-700"
            >
              Cancel
            </DialogClose>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="shadow-2xs cursor-pointer rounded-xl bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white ring-offset-2 ring-offset-background transition-all duration-300 hover:bg-red-600 hover:ring-2 hover:ring-red-700"
            >
              {deleteText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
