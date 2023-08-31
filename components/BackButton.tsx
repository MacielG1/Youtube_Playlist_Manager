import Link from "next/link";
import { Icons } from "@/assets/Icons";

export default function BackButton() {
  return (
    <div className="z-50 px-4 py-3 xl:px-5 absolute top-0 left-0">
      <Link href="/" className=" text-neutral-400 hover:text-neutral-500">
        <Icons.arrowLeft className="w-8 h-8 text-blue-600" />
      </Link>
      {/* <a href="/" className=" text-neutral-400 hover:text-neutral-500">
        <Icons.arrowLeft className="w-8 h-8 text-blue-600" />
      </a> */}
    </div>
  );
}
