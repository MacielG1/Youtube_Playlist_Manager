"use client";

import { useState } from "react";
import { Icons } from "@/assets/Icons";

import ModalSettings from "../modals/ModalSettings";
import ImportExportTimers from "./ImportExportTimers";
import ThemeToggler from "./ThemeToggler";
import DeleteAllData from "./DeleteAllData";

export default function SettingsMenu() {
  let [isOpen, setIsOpen] = useState(false);

  let content = (
    <div className="flex flex-col justify-center items-center">
      <ThemeToggler />
      <ImportExportTimers setModalOpen={setIsOpen} />
      <DeleteAllData parentModalSetter={setIsOpen} />
    </div>
  );

  function ToggleModal() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="p-1 sm:p-2 sm:py-4 md:py-5 sm:px-10 flex justify-end sm:absolute top-0 right-0 z-30">
      <div className="relative">
        <div onClick={ToggleModal}>
          <Icons.settingIcon className="h-8 w-8 cursor-pointer" />
        </div>

        {isOpen && <ModalSettings onClose={ToggleModal} content={content} />}
      </div>
    </div>
  );
}
