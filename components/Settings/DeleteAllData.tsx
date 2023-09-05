import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ModalDelete from "../modals/ModalDelete";
import { useRouter } from "next/navigation";
import useIsExportable from "@/hooks/useIsExportable";

type Props = {
  parentModalSetter: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DeleteAllData({ parentModalSetter }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const isExportable = useIsExportable();

  function deleteAllData() {
    localStorage.removeItem("playlists");
    localStorage.removeItem("videos");

    const allKeys = Object.keys(localStorage);

    const keysToRemove = ["pl=", "v=", "plVideos="];

    allKeys.forEach((key) => {
      if (keysToRemove.some((prefix) => key.startsWith(prefix))) {
        localStorage.removeItem(key);
      }
    });

    // delete all queries
    queryClient.clear();

    setIsModalOpen(false);
    parentModalSetter(false);
    router.refresh();
    router.push("/", { scroll: false });
  }

  function ToggleModal() {
    setIsModalOpen((prev) => !prev);
  }

  function onCancelDelete() {
    setIsModalOpen(false);
    parentModalSetter(false);
  }

  const content = (
    <div className="flex flex-col gap-4 items-center justify-center px-2 pt-2 pb-6 max-w-[20rem] xs:max-w-sm sm:max-w-md">
      <h2 className="text-lg sm:text-2xl text-red-500 font-semibold tracking-wide text-center">Delete All Saved Data</h2>
      <p className="text-lg text-center px-4">This will remove all of your Playlists and Videos that are saved</p>
      <div className="flex gap-3 pt-3 text-lg">
        <button
          onClick={onCancelDelete}
          className="bg-zinc-700 font-semibold border-neutral-900 border-2 text-neutral-300 hover:text-neutral-200 cursor-pointer px-3 py-1 rounded-md hover:bg-zinc-600 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={deleteAllData}
          className="bg-red-600 font-semibold border-neutral-900 border-2 text-black cursor-pointer px-3 py-1 rounded-md hover:bg-red-500 transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className={`${isExportable ? "px-7" : "px-[0.4rem]"} 
                hover:cursor-pointer  mt-1  py-2 h-10 bg-neutral-800 text-white hover:bg-neutral-900 hover:border border
              border-neutral-950 duration-300 rounded-md text-base font-medium ring-offset-background transition-colors focus-visible:outline-none 
                focus-visible:border focus-visible:border-neutral-400 `}
        onClick={ToggleModal}
      >
        Delete Data
      </button>
      {isModalOpen && <ModalDelete onClose={ToggleModal} content={content} />}
    </>
  );
}
