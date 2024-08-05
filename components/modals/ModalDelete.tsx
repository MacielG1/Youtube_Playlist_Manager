import { createPortal } from "react-dom";

type ModalSettingsProps = {
  onClose: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  content: React.ReactNode;
};

export default function ModalDelete({ onClose, content }: ModalSettingsProps) {
  let modal = (
    <>
      {/* Backdrop */}
      <button type="button" className="fixed left-0 top-0 z-30 h-full w-full cursor-default bg-black bg-opacity-70" onClick={onClose} />
      <>
        {/* Modal */}
        <div className="fixed inset-0 z-50 mx-auto flex w-[50%] items-center justify-center">
          <div className="flex flex-col gap-2 rounded-lg border-2 border-neutral-700 bg-zinc-300 p-4 py-7 shadow-lg dark:border-neutral-700 dark:bg-black">
            {content}
          </div>
        </div>
      </>
    </>
  );
  return createPortal(modal, document.getElementById("modal-delete") as HTMLElement);
}
