"use client";
import { useState } from "react";
import ModalSettings from "../modals/ModalSettings";
import ImportExportTimers from "./ImportExportTimers";
import ThemeToggler from "./ThemeToggler";
import HowItWorks from "./HowItWorks";
import { usePathname } from "next/navigation";
import Settings from "@/assets/icons/Settings";
import ToggleMute from "./ToggleMute";
import SupportButton from "./SupportButton";
import DeleteAllDataModal from "../modals/DeleteAllDataModal";

export default function SettingsMenu() {
  let [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  function closeSettingsModal() {
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
      {/* <DeleteAllBtn openDeleteModal={openDeleteModal} /> */}

      <DeleteAllDataModal closeSettingsModal={closeSettingsModal} />
      <SupportButton />
      <ToggleMute />
    </div>
  );
  const isPlaylist = pathname.includes("/playlist");

  return (
    <div className={`absolute top-0 right-2 z-30 p-1 px-5 pt-2 sm:px-6 ${isPlaylist ? "xl:pr-1" : "xl:px-7"}`}>
      <button onClick={ToggleModal}>
        <Settings className="h-8 w-8 cursor-pointer" />
      </button>

      {isOpen && <ModalSettings onClose={ToggleModal} content={content} />}
      {/* {isDeleteModalOpen && <ModalDelete onClose={closeModals} content={<DeleteAllDataContent closeModals={closeModals} />} />} */}
    </div>
  );
}
