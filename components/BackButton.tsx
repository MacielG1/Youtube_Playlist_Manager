import Link from "next/link";

import { Icons } from "@/assets/Icons";

export default function BackButton() {
  return (
    <div className="px-4 py-2 absolute top-0 left-0">
      <Link href="/" className=" text-neutral-400 hover:text-neutral-500">
        <Icons.arrowLeft className="w-8 h-8 text-blue-600" />
      </Link>
    </div>
  );
}
