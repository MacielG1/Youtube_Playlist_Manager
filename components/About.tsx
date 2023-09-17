import Image from "next/image";
import Link from "next/link";
import aboutIMG from "@/assets/aboutIMG.webp";
import { Icons } from "@/assets/Icons";

let texts = [
  { id: 1, text: "This app makes it simple to organize and manage your playlists" },
  { id: 2, text: "You can add either a public or unlisted YouTube playlists, or type a channel name to create a playlist with all the videos from it" },
  { id: 3, text: "You can also drag and drop the items to reorder them as you like" },
  { id: 4, text: "The app will remember the playlist and video position and will continue to play from where you left off" },
];

export default function About() {
  return (
    <div className="pt-25 relative isolate z-10 flex items-center lg:h-screen">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col-reverse gap-16 bg-inherit px-6 py-16 ring-0 ring-black/10 dark:ring-white/10 sm:rounded-3xl sm:p-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:bg-zinc-200/90 lg:py-16 lg:ring-1 lg:dark:bg-white/5 xl:gap-x-20 xl:px-20">
          <Image
            src={aboutIMG}
            className="hidden w-full rounded-2xl object-cover shadow-xl xs:block xs:flex-none sm:h-96 lg:h-auto lg:max-w-sm"
            alt="about image"
            priority
          />
          <div className="w-full flex-auto pt-10 xs:pt-0 ">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-wide text-black dark:text-neutral-200 sm:text-4xl">How It Works!</h2>
            <div className="flex flex-col  gap-3 text-lg">
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
    </div>
  );
}
