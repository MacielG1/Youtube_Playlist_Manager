"use client";
import { useState } from "react";
import ModalSettings from "../modals/ModalSettings";
import ImportExportTimers from "./ImportExportTimers";
import ThemeToggler from "./ThemeToggler";
import DeleteAllDataContent from "../modals/DeleteAllDataContent";
import HowItWorks from "./HowItWorks";
import ModalDelete from "../modals/ModalDelete";
import DeleteAllBtn from "./DeleteAllBtn";
import { usePathname } from "next/navigation";
import Settings from "@/assets/icons/Settings";
import ToggleMute from "./ToggleMute";
import Link from "next/link";
import Button from "../Button";

export default function SettingsMenu() {
  let [isOpen, setIsOpen] = useState(false);
  let [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const pathname = usePathname();

  function openDeleteModal() {
    setIsDeleteModalOpen(true);
    setIsOpen(false);
  }

  function closeModals() {
    setIsDeleteModalOpen(false);
    setIsOpen(false);
  }

  function ToggleModal() {
    setIsOpen((prev) => !prev);
  }

  let content = (
    <div className="flex flex-col items-center justify-center gap-y-2 pb-3">
      <ThemeToggler />
      <ImportExportTimers setModalOpen={setIsOpen} />
      <HowItWorks setModalOpen={setIsOpen} />
      <DeleteAllBtn openDeleteModal={openDeleteModal} />
      <Link target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/macielg1">
        <Button className="max-w-[9rem] whitespace-nowrap border border-neutral-950 text-sm">Support the Project</Button>
      </Link>
      <ToggleMute />
    </div>
  );
  const isPlaylist = pathname.includes("/playlist");

  return (
    <div className={`absolute right-2 top-0 z-30 p-1 px-5 pt-2 sm:px-6 ${isPlaylist ? "xl:pr-1" : "xl:px-7"}`}>
      <button onClick={ToggleModal}>
        <Settings className="h-8 w-8 cursor-pointer" />
      </button>

      {isOpen && <ModalSettings onClose={ToggleModal} content={content} />}
      {isDeleteModalOpen && <ModalDelete onClose={closeModals} content={<DeleteAllDataContent closeModals={closeModals} />} />}
    </div>
  );
}
