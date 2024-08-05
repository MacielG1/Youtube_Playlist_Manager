import reduceStringSize from "@/utils/reduceStringLength";
import Button from "../Button";

type Props = {
  type: string;
  title: string;
  id: string;
  openModal: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export default function DeleteModalContent({ type, title, id, openModal, onDelete, isLoading = false }: Props) {
  return (
    <div className="mx-auto flex max-w-[18rem] flex-col items-center justify-center gap-4 px-8 pb-6 pt-2 xs:max-w-sm sm:max-w-lg md:min-w-[18rem]">
      <h2 className="text-lg font-semibold tracking-wide text-red-600 dark:text-red-500 sm:text-2xl">Delete {type}</h2>
      <h3 className="max-h-[50vh] max-w-full overflow-auto break-words pt-2 text-center text-sm font-semibold text-neutral-800 dark:text-neutral-400 sm:text-lg">
        {title}
      </h3>

      <div className="flex gap-3 pt-3 text-lg">
        <Button
          onClick={openModal}
          className="bg-neutral-600 text-white ring-1 ring-neutral-500 hover:bg-neutral-700 dark:bg-neutral-700 dark:ring-0 dark:hover:bg-neutral-800"
        >
          Cancel
        </Button>
        <Button onClick={() => onDelete(id)} disabled={isLoading} variant="delete">
          Delete
        </Button>
      </div>
    </div>
  );
}
