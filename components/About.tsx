import Image from "next/image";
import Link from "next/link";
import aboutIMG from "@/assets/aboutIMG.png";

export default function About() {
  return (
    <>
      <div className="relative isolate z-10 mt-32 sm:mt-40">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-16 bg-zinc-200/90 px-6 py-16 ring-1 ring-black/10 dark:bg-white/5 dark:ring-white/10 sm:rounded-3xl sm:p-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:py-20 xl:gap-x-20 xl:px-20">
            <Image
              src={aboutIMG}
              className="h-96 w-full flex-none rounded-2xl object-cover shadow-xl lg:h-auto lg:max-w-sm"
              alt="about image"
              priority
            />
            <div className="w-full flex-auto ">
              <h2 className="mb-8 text-center text-3xl font-bold tracking-wide text-black dark:text-neutral-200 sm:text-4xl">
                How It Works!
              </h2>
              <div className="flex flex-col gap-3 text-lg">
                <h2 className="relative leading-8 text-neutral-600 dark:text-neutral-300 sm:max-w-md lg:max-w-none">
                  This app makes it simple to organize and manage your playlists
                </h2>
                <p className="relativeleading-8 text-neutral-600 dark:text-neutral-300 sm:max-w-md lg:max-w-none">
                  You can add either public or unlisted YouTube playlists, or
                  enter a channel name to create a playlist with all videos from
                  it
                </p>
                <p className="relativeleading-8 text-neutral-600 dark:text-neutral-300 sm:max-w-md lg:max-w-none">
                  You can also drag and drop the playlists to reorder them as
                  you like
                </p>
                <p className="relative leading-8 text-neutral-600 dark:text-neutral-300 sm:max-w-md lg:max-w-none ">
                  The app remembers the playlist position and time and will
                  continue to play from where you left off
                </p>
                <p className="relative leading-8 text-neutral-600 dark:text-neutral-300 sm:max-w-md lg:max-w-none ">
                  Adding videos is also possible and can be useful in certain
                  situations, like a long live stream.
                </p>
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

        <div
          className="absolute inset-x-0 -top-16 -z-10 flex transform-gpu justify-center overflow-hidden opacity-20 blur-3xl"
          aria-hidden="true"
        >
          <div className=" aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20" />
        </div>
      </div>
    </>
  );
}
