import Link from "next/link";
import Image from "next/image";
import leftArrow from "@/assets/arrowLeft.svg";

export default function BackButton() {
  return (
    <div className="px-4 py-2 absolute top-0 left-0">
      <Link className=" text-neutral-400 hover:text-neutral-500" href="/">
        <Image src={leftArrow} alt="back button" unoptimized width={24} height={24} priority />
      </Link>
    </div>
  );
}
