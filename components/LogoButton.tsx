import Link from "next/link";
import { Icons } from "@/assets/Icons";

export default function LogoButton() {
  return (
    <Link href="/" className="absolute left-0 top-0 z-50 px-4 pb-1 pt-3 text-neutral-400 hover:text-neutral-500 xl:px-5">
      <Icons.logo className="w-10 " />
    </Link>
  );
}
