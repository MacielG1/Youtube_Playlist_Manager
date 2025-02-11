import useIsExportable from "@/hooks/useIsExportable";
import Link from "next/link";
import Button from "../Button";

type Props = {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HowItWorksButton({ setModalOpen }: Props) {
  const isExportable = useIsExportable();

  return (
    <Link href="/about" tabIndex={-1}>
      <Button
        className={`${isExportable ? "px-8" : "px-[6.4px]"} max-w-[144px] cursor-pointer border border-neutral-950 whitespace-nowrap`}
        onClick={() => setModalOpen(false)}
      >
        How it Works
      </Button>
    </Link>
  );
}
