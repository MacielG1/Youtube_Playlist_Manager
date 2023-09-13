import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ModalDelete from "../modals/ModalDelete";
import { useRouter } from "next/navigation";
import useIsExportable from "@/hooks/useIsExportable";
import Button from "../Button";

type Props = {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DeleteAllData({ setModalOpen }: Props) {
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
    setModalOpen(false);
    router.refresh();
    router.push("/", { scroll: false });
  }

  function ToggleModal() {
    setIsModalOpen((prev) => !prev);
  }

  function onCancelDelete() {
    setIsModalOpen(false);
    setModalOpen(false);
  }

  if (!isExportable) return null;

  const content = (
    <div className="flex max-w-[20rem] flex-col items-center justify-center gap-4 px-2 pb-6 pt-2 xs:max-w-sm sm:max-w-md">
      <h2 className="text-center text-lg font-semibold tracking-wide text-red-500 sm:text-2xl">Delete All Saved Data</h2>
      <p className="px-4 text-center text-lg">This will remove all of your saved Playlists and Videos stored in here</p>
      <div className="flex gap-3 pt-3 text-lg">
        <button
          onClick={onCancelDelete}
          className="cursor-pointer rounded-md border-2 border-neutral-900 bg-zinc-700 px-3 py-1 font-semibold text-neutral-300 transition duration-200 hover:bg-zinc-600 hover:text-neutral-200"
        >
          Cancel
        </button>
        <button
          onClick={deleteAllData}
          className="cursor-pointer rounded-md border-2 border-neutral-900 bg-red-500 px-3 py-1 font-semibold text-black transition duration-200 hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Button className="max-w-[9rem] whitespace-nowrap border border-neutral-950 px-[4rem]" onClick={ToggleModal}>
        Delete Data
      </Button>
      {isModalOpen && <ModalDelete onClose={ToggleModal} content={content} />}
    </>
  );
}
