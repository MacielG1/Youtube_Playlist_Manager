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
    <div className="flex flex-col justify-center items-center pb-3">
      <ThemeToggler />
      <ImportExportTimers setModalOpen={setIsOpen} />
      <DeleteAllData parentModalSetter={setIsOpen} />
    </div>
  );

  function ToggleModal() {
    setIsOpen(!isOpen);
  }

  return (
    <div className=" flex xs:absolute p-2 py-3 sm:px-5 xl:px-8  justify-end top-0 right-0 ">
      <button onClick={ToggleModal} className="z-50">
        <Icons.settingIcon className="h-8 w-8 cursor-pointer " />
      </button>

      {isOpen && <ModalSettings onClose={ToggleModal} content={content} />}
    </div>
  );
}
