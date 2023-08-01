export default function DeleteModalContent({ type, title, id, openModal, onDelete }) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center  px-2 pt-2 pb-6 max-w-[16rem] xs:max-w-sm sm:max-w-md">
      <h2 className="text-lg sm:text-2xl text-red-500 font-semibold  tracking-wide">Confirm Deletion</h2>

      <h3 className="text-neutral-800 dark:text-neutral-400 sm:text-lg text-center font-semibold px-5 pt-2 max-w-[16rem] xs:max-w-sm  sm:max-w-md break-words">
        Delete {type} - <span>{title}</span>
      </h3>

      <div className="flex gap-3 pt-3 text-lg">
        <button
          onClick={openModal}
          className="bg-gray-600/90 border-neutral-800 text-neutral-300 hover:text-neutral-200  cursor-pointer  px-3 py-1 rounded-md hover:bg-gray-700 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onDelete(id)}
          className="bg-red-500 border-neutral-800 text-black    cursor-pointer  px-3 py-1 rounded-md hover:bg-[#d32828] transition duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
