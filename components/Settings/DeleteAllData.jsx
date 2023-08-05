import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ModalDelete from "../modals/ModalDelete";

export default function DeleteAllData({ parentModalSetter }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  function deleteAllData() {
    localStorage.removeItem("playlists");
    localStorage.removeItem("videos");

    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (key.startsWith("pl=")) {
        localStorage.removeItem(key);
      } else if (key.startsWith("v=")) {
        localStorage.removeItem(key);
      }
    });

    queryClient.invalidateQueries("playlists");
    queryClient.invalidateQueries("videos");

    setIsModalOpen(false);
    parentModalSetter(false);
  }

  function ToggleModal() {
    setIsModalOpen((prev) => !prev);
  }

  function onCancelDelete() {
    setIsModalOpen(false);
    parentModalSetter(false);
  }

  const content = (
    <div className="flex flex-col gap-4 items-center justify-center  px-2 pt-2 pb-6 max-w-[16rem] xs:max-w-sm sm:max-w-md">
      <h2 className="text-lg sm:text-2xl text-red-500 font-semibold tracking-wide">Delete All Data</h2>
      <p className="text-lg">This will delete all of your saved data</p>
      <div className="flex gap-3 pt-3 text-lg">
        <button
          onClick={onCancelDelete}
          className="bg-gray-600/90 font-semibold border-neutral-800 text-neutral-300 hover:text-neutral-200  cursor-pointer  px-3 py-1 rounded-md hover:bg-gray-700 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={deleteAllData}
          className="bg-red-500  font-semibold border-neutral-800 text-black cursor-pointer px-3 py-1 rounded-md hover:bg-[#d32828] transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="  hover:cursor-pointer  mt-1 px-2 py-2 h-10 bg-neutral-800 text-white hover:bg-neutral-900 hover:border border border-neutral-950 duration-300 rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:border focus-visible:border-neutral-400 "
        onClick={ToggleModal}
      >
        Delete Data
      </button>
      {isModalOpen && <ModalDelete onClose={ToggleModal} content={content} />}
    </>
  );
}
