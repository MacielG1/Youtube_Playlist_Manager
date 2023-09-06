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
    <div className="flex flex-col items-center justify-center pb-3">
      <ThemeToggler />
      <ImportExportTimers setModalOpen={setIsOpen} />
      <DeleteAllData parentModalSetter={setIsOpen} />
    </div>
  );

  function ToggleModal() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="right-0 top-0 z-50 flex items-end justify-end p-2 py-3 xs:fixed sm:px-5 xl:px-8">
      <button onClick={ToggleModal}>
        <Icons.settingIcon className="h-8 w-8 cursor-pointer" />
      </button>

      {isOpen && <ModalSettings onClose={ToggleModal} content={content} />}
    </div>
  );
}
