import Link from "next/link";
import Logo from "@/assets/icons/Logo";

export default function LogoButton() {
  return (
    <Link href="/" className="fixed left-3 top-0 z-50 pb-1 pl-5 pt-3 text-neutral-400 hover:text-neutral-500 xl:px-5" scroll={false}>
      <Logo className="w-10" />
    </Link>
  );
}
