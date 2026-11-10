import Reset from "@/assets/icons/Reset";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../Dialog";
import { Checkbox } from "../Checkbox";
import { useCallback, useEffect, useRef, useState } from "react";

type ModalSettingsProps = {
  resetPlaylist: (isChecked: boolean) => void;
  handleVideoPlayback: (play: "play" | "pause") => void | Promise<void>;
  isVideoPaused: () => Promise<boolean>;
};

export default function ResetPlaylistModal({ handleVideoPlayback, resetPlaylist, isVideoPaused }: ModalSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const wasPausedByModalRef = useRef(false);
  const pauseGenerationRef = useRef(0);
  const mountedRef = useRef(false);
  const openRef = useRef(false);
  const confirmedRef = useRef(false);

  const bumpPauseGeneration = useCallback(() => {
    pauseGenerationRef.current++;
  }, []);

  function handleCheckboxChange(checked: boolean) {
    setIsChecked(checked);
  }

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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={handlePauseVideo}
          className="cursor-pointer text-neutral-600 outline-hidden transition duration-300 hover:text-neutral-950 focus:text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <Reset className="mb-[2.5px] size-[30px]" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center">Restart Playlist</DialogTitle>
        <div className="items-top mx-auto flex items-center space-x-2 pt-3">
          <Checkbox id="checkbox-reset" checked={isChecked} onCheckedChange={handleCheckboxChange} />

          <label htmlFor="checkbox-reset" className="cursor-pointer text-neutral-800 dark:text-neutral-400">
            Re-add manually removed videos
          </label>
        </div>

        <div className="mx-auto flex gap-3 pt-3 text-lg">
          <DialogClose asChild>
            <button
              onClick={() => {
                if (wasPausedByModalRef.current) {
                  void Promise.resolve(handleVideoPlayback("play")).catch(() => {});
                  wasPausedByModalRef.current = false;
                }
              }}
              className="ring-offset-background cursor-pointer rounded-xl bg-neutral-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-2xs ring-offset-2 transition-all duration-300 hover:bg-neutral-600 hover:ring-2 hover:ring-neutral-700"
            >
              Cancel
            </button>
          </DialogClose>
          <DialogClose asChild>
            <button
              onClick={() => {
                confirmedRef.current = true;
                wasPausedByModalRef.current = false;
                bumpPauseGeneration();
                resetPlaylist(isChecked);
              }}
              className="ring-offset-background cursor-pointer rounded-xl bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-2xs ring-offset-2 transition-all duration-300 hover:bg-red-600 hover:ring-2 hover:ring-red-700"
            >
              Restart
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
