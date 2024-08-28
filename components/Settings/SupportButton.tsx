import useIsExportable from "@/hooks/useIsExportable";
import Link from "next/link";
import Button from "../Button";

export default function SupportButton() {
  const isExportable = useIsExportable();

  return (
    <Link target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/macielg1">
      <Button className={`${isExportable ? "px-16" : "px-3"} max-w-[9rem] whitespace-nowrap border border-neutral-950`}>Support Me</Button>
    </Link>
  );
}
