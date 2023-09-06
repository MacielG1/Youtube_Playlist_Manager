import Link from "next/link";
import { Icons } from "@/assets/Icons";

export default function BackButton() {
  return (
    <div className="absolute left-0 top-0 z-50 px-4 py-3 xl:px-5">
      <Link href="/" className="text-neutral-400 hover:text-neutral-500">
        <Icons.arrowLeft className="h-8 w-8 text-blue-600" />
      </Link>
    </div>
  );
}
