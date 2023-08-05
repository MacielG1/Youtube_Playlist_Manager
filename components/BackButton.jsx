import Link from "next/link";
import Image from "next/image";
import leftArrow from "@/assets/arrowLeft.svg";

export default function BackButton() {
  return (
    <div className="px-4 py-2 absolute top-0 left-0">
      <Link href="/" className=" text-neutral-400 hover:text-neutral-500">
        <Image src={leftArrow} alt="back button" unoptimized width={28} height={28} priority />
      </Link>
    </div>
  );
}
