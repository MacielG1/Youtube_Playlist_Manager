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
    <div className="flex max-w-[20rem] flex-col items-center justify-center gap-4 px-2 pb-6 pt-2 xs:max-w-sm sm:max-w-md">
      <h2 className="text-center text-lg font-semibold tracking-wide text-red-500 sm:text-2xl">
        Delete All Saved Data
      </h2>
      <p className="px-4 text-center text-lg">
        This will remove all of your Playlists and Videos that are saved
      </p>
      <div className="flex gap-3 pt-3 text-lg">
        <button
          onClick={onCancelDelete}
          className="cursor-pointer rounded-md border-2 border-neutral-900 bg-zinc-700 px-3 py-1 font-semibold text-neutral-300 transition duration-200 hover:bg-zinc-600 hover:text-neutral-200"
        >
          Cancel
        </button>
        <button
          onClick={deleteAllData}
          className="cursor-pointer rounded-md border-2 border-neutral-900 bg-red-600 px-3 py-1 font-semibold text-black transition duration-200 hover:bg-red-500"
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
                mt-1  h-10  rounded-md border border-neutral-950 bg-neutral-800 py-2 text-base font-medium
              text-white ring-offset-background transition-colors duration-300 hover:cursor-pointer hover:border hover:bg-neutral-900 focus-visible:border 
                focus-visible:border-neutral-400 focus-visible:outline-none `}
        onClick={ToggleModal}
      >
        Delete Data
      </button>
      {isModalOpen && <ModalDelete onClose={ToggleModal} content={content} />}
    </>
  );
}
