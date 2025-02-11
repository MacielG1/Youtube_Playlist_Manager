import useIsExportable from "@/hooks/useIsExportable";
import Link from "next/link";
import Button from "../Button";

export default function SupportButton() {
  const isExportable = useIsExportable();

  return (
    <Link target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/macielg1">
      <Button className={`${isExportable ? "px-16" : "px-3"} max-w-[144px] cursor-pointer border border-neutral-950 whitespace-nowrap`}>Support Me</Button>
    </Link>
  );
}
