import useIsExportable from "@/hooks/useIsExportable";
import Button from "../Button";
import Link from "next/link";

type Props = {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HowItWorksButton({ setModalOpen }: Props) {
  const isExportable = useIsExportable();

  return (
    <Link href="/about">
      <Button className={`${isExportable ? "px-8" : "px-[0.4rem]"} max-w-[9rem] whitespace-nowrap border border-neutral-950`} onClick={() => setModalOpen(false)}>
        How it Works
      </Button>
    </Link>
  );
}
