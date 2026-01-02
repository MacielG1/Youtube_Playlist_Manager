import { createPortal } from "react-dom";

type ModalSettingsProps = {
  onClose: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  content: React.ReactNode;
};

export default function ModalSettings({ onClose, content }: ModalSettingsProps) {
  let modal = (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed top-14 right-4 z-50 w-[220px] origin-top-right animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 max-[350px]:right-2 max-[350px]:w-[calc(100%-1rem)] sm:right-6 xl:right-8 2xl:right-10">
        <div className="overflow-hidden rounded-2xl border border-neutral-200/50 bg-white/95 shadow-xl backdrop-blur-md dark:border-neutral-700/50 dark:bg-neutral-800/95">
          <div className="border-b border-neutral-200/50 px-4 py-3 dark:border-neutral-700/50">
            <h3 className="text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100">Settings</h3>
          </div>
          <div className="p-3">{content}</div>
        </div>
      </div>
    </>
  );
  return createPortal(modal, document.getElementById("modal-settings") as HTMLElement);
}
