import Link from "next/link";
import { Icons } from "@/assets/Icons";

export default function BackButton() {
  return (
    <div className="absolute left-0 top-0 z-50 px-4 py-3 xl:px-5">
      <Link href="/" className="text-neutral-400 hover:text-neutral-500">
        <Icons.logo className="h-10 w-10 " />
      </Link>
    </div>
  );
}
