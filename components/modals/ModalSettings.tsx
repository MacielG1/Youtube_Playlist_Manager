import { createPortal } from "react-dom";

type ModalSettingsProps = {
  onClose: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  content: React.ReactNode;
};

export default function ModalSettings({ onClose, content }: ModalSettingsProps) {
  let modal = (
    <>
      {/* Backdrop */}
      <button type="button" className="cursor-defaulf fixed top-0 left-0 z-20 h-full w-full bg-black/70" onClick={onClose} />
      <>
        {/* Modal */}
        <div className="fixed top-11 right-10 z-30 mt-1 flex w-fit flex-col gap-2 rounded-lg bg-neutral-300 p-4 px-6 shadow-md max-[350px]:right-1 max-[350px]:w-[95%] max-[350px]:p-1 max-[350px]:text-base xl:px-9 2xl:right-[41.5px] dark:bg-neutral-700">
          {content}
        </div>
      </>
    </>
  );
  return createPortal(modal, document.getElementById("modal-settings") as HTMLElement);
}
