"use client";
import { createPortal } from "react-dom";

export function Backdrop({ onClick }) {
  return <div className="fixed top-0 left-0 w-full h-screen z-20  bg-black/70" onClick={onClick}></div>;
}

export default function ModalSettings({ onClose, content }) {
  let modal = (
    <>
      <Backdrop onClick={onClose} />
      <div className="absolute inset-0 flex justify-center items-center ">
        <div className="w-fit flex flex-col p-4 gap-2 z-50 py-7 bg-zinc-300 dark:bg-black border-2 border-neutral-600 rounded-lg shadow-md mx-auto">{content}</div>
      </div>
    </>
  );
  return createPortal(modal, document.getElementById("modal-root"));
}
