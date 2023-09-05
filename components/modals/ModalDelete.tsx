import { createPortal } from "react-dom";

type ModalSettingsProps = {
  onClose: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  content: React.ReactNode;
};

export default function ModalSettings({ onClose, content }: ModalSettingsProps) {
  let modal = (
    <>
      {/* Backdrop */}
      <button type="button" className="cursor-default fixed top-0 left-0 w-full h-[100vh] z-20 bg-black bg-opacity-60" onClick={onClose} />
      <>
        {/* Modal */}
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-fit flex flex-col p-4 gap-2 z-50 py-7 bg-zinc-300 dark:bg-black border-2 border-neutral-600 rounded-lg shadow-md mx-auto">{content}</div>
        </div>
      </>
    </>
  );
  return createPortal(modal, document.getElementById("modal-root") as HTMLElement);
}
