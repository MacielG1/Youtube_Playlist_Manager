import { createPortal } from "react-dom";

type ModalSettingsProps = {
  onClose: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  content: React.ReactNode;
};

export default function ModalSettings({
  onClose,
  content,
}: ModalSettingsProps) {
  let modal = (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed left-0 top-0 z-20 h-[100vh] w-full cursor-default bg-black bg-opacity-60"
        onClick={onClose}
      />
      <>
        {/* Modal */}
        <div
          className="absolute right-10 top-14 z-30 mt-1 flex w-fit flex-col gap-2 rounded-lg bg-neutral-300 p-4 shadow-md dark:bg-zinc-700
       max-[350px]:right-1 max-[350px]:w-[95%] max-[350px]:p-1 max-[350px]:text-base"
        >
          {content}
        </div>
      </>
    </>
  );
  return createPortal(
    modal,
    document.getElementById("modal-root") as HTMLElement,
  );
}
