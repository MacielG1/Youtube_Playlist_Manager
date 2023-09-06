type Props = {
  type: string;
  title: string;
  id: string;
  openModal: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export default function DeleteModalContent({
  type,
  title,
  id,
  openModal,
  onDelete,
  isLoading = false,
}: Props) {
  return (
    <div className="flex max-w-[16rem] flex-col items-center justify-center gap-4 px-2 pb-6 pt-2 xs:max-w-sm sm:max-w-md">
      <h2 className="text-lg font-semibold tracking-wide text-red-500 sm:text-2xl">
        Confirm Deletion
      </h2>
      <h3 className="max-w-[16rem] break-words px-5 pt-2 text-center font-semibold text-neutral-800 dark:text-neutral-400 xs:max-w-sm sm:max-w-md sm:text-lg">
        Delete {type}: {title}
      </h3>

      <div className="flex gap-3 pt-3 text-lg">
        <button
          onClick={openModal}
          className="cursor-pointer rounded-md border-neutral-800 bg-gray-600/90 px-3 py-1 font-semibold text-neutral-300 transition duration-200 hover:bg-gray-700 hover:text-neutral-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onDelete(id)}
          disabled={isLoading}
          className="cursor-pointer rounded-md border-neutral-800 bg-red-500 px-3 py-1 font-semibold text-black transition duration-200 hover:bg-[#d32828]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
