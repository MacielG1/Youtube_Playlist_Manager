"use client";
import { useState } from "react";
import { Icons } from "@/assets/Icons";

import ModalSettings from "../modals/ModalSettings";
import ImportExportTimers from "./ImportExportTimers";
import ThemeToggler from "./ThemeToggler";
import DeleteAllDataContent from "../modals/DeleteAllDataContent";
import HowItWorks from "./HowItWorks";
import ModalDelete from "../modals/ModalDelete";
import DeleteAllBtn from "./DeleteAllBtn";

export default function SettingsMenu() {
  let [isOpen, setIsOpen] = useState(false);
  let [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    </div>
  );

  return (
    <div className="fixed right-2 top-0 z-30 p-1 px-5 pt-2 sm:px-6 xl:px-7">
      <button onClick={ToggleModal}>
        <Icons.settingIcon className="h-8 w-8 cursor-pointer" />
      </button>

      {isOpen && <ModalSettings onClose={ToggleModal} content={content} />}
      {isDeleteModalOpen && <ModalDelete onClose={closeModals} content={<DeleteAllDataContent closeModals={closeModals} />} />}
    </div>
  );
}
