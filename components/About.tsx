import Image from "next/image";
import Link from "next/link";
import aboutIMG from "@/assets/aboutIMG.png";
import { Icons } from "@/assets/Icons";

let texts = [
  { id: 1, text: "This app makes it simple to organize and manage your playlists" },
  { id: 2, text: "You can add either a public or unlisted YouTube playlists, or type a channel name to create a playlist with all the videos from it" },
  { id: 3, text: "You can also drag and drop the items to reorder them as you like" },
  { id: 4, text: "The app will remember the playlist and video position and will continue to play from where you left off" },
];

export default function About() {
  return (
    <div className="relative isolate z-10 mt-32 sm:mt-40">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-16 bg-zinc-200/90 px-6 py-16 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10 sm:rounded-3xl sm:p-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:py-20 xl:gap-x-20 xl:px-20">
          <Image src={aboutIMG} className="h-96 w-full flex-none rounded-2xl object-cover shadow-xl lg:h-auto lg:max-w-sm" alt="about image" priority />
          <div className="w-full flex-auto ">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-wide text-black dark:text-neutral-200 sm:text-4xl">How It Works!</h2>
            <div className="flex flex-col gap-3 text-lg">
              {texts.map((i) => (
                <div key={i.id} className="flex items-center justify-start gap-2">
                  <Icons.checkMark className="h-5 w-5 min-w-[2rem]" />
                  <p className="relative leading-8 text-neutral-600 dark:text-neutral-300 sm:max-w-md lg:max-w-none">{i.text}</p>
                </div>
              ))}
            </div>
            <div className="flex max-w-lg items-center justify-center py-4 sm:ml-10">
              <Link
                href="/"
                className="focus-visible:ring-ring inline-flex items-center justify-center rounded-md bg-indigo-800 px-5 py-2 text-sm font-medium text-neutral-300 ring-offset-background transition-colors hover:bg-indigo-900 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Return
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 -top-16 -z-10 flex transform-gpu justify-center overflow-hidden opacity-20 blur-3xl" aria-hidden="true">
        <div className=" aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20" />
      </div>
    </div>
  );
}
