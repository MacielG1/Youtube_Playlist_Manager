import { createPortal } from "react-dom";

type ModalSettingsProps = {
  onClose: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  content: React.ReactNode;
};

export default function ModalDelete({ onClose, content }: ModalSettingsProps) {
  let modal = (
    <>
      {/* Backdrop */}
      <button type="button" className="fixed left-0 top-0 z-50 h-[100vh] w-full cursor-default bg-black bg-opacity-70" onClick={onClose} />
      <>
        {/* Modal */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="z-50 mx-auto flex w-fit flex-col gap-2 rounded-lg border-2 border-neutral-400 bg-zinc-300 p-4 py-7 shadow-lg dark:border-neutral-700 dark:bg-black">
            {content}
          </div>
        </div>
      </>
    </>
  );
  return createPortal(modal, document.getElementById("modal-root") as HTMLElement);
}
