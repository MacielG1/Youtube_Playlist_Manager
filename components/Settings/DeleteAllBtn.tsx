import Button from "@/components/Button";
import useIsExportable from "@/hooks/useIsExportable";

export default function DeleteAllBtn({ openDeleteModal }: { openDeleteModal: () => void }) {
  const isExportable = useIsExportable();

  if (!isExportable) return null;

  return (
    <Button className="max-w-[9rem] whitespace-nowrap border border-neutral-950 px-[4rem]" onClick={openDeleteModal}>
      Delete Data
    </Button>
  );
}
