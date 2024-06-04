import Image from "next/image";
import Link from "next/link";
import aboutIMG from "@/assets/aboutIMG.webp";
import CheckMark from "@/assets/icons/CheckMark";
import React from "react";

const texts = [
  { id: 1, text: "Easily organize and manage your youtube playlists" },
  {
    id: 2,
    text: "Add public or unlisted YouTube playlists, or generate a playlist with all the videos from a channel",
  },
  { id: 3, text: "Reorder items by dragging and dropping them" },
  { id: 4, text: "It auto saves your playlist and video progress, resuming playback where you left off" },
];

export default function About({ button }: { button?: React.ReactNode }) {
  return (
    <div className="pt-25 relative isolate z-10 flex items-center overflow-hidden lg:h-screen">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div
          className="first-line: absolute bottom-1 right-[calc(50%-4rem)] -z-10 transform-gpu blur-3xl sm:right-[calc(50%-18rem)] xl:bottom-[calc(50%-30rem)] xl:right-[calc(65%-24rem)]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1108/632] w-[80rem] bg-gradient-to-r from-indigo-500 to-purple-700 opacity-10"
            style={{
              clipPath:
                "polygon(10% 20%, 80% 30%, 70% 80%, 40% 10%, 60% 80%, 55% 40%, 42% 27%, 30% 60%, 45% 50%, 30.3% 57%, 26% 64.1%, 59% 20%, 15.4% 31.1%, 35% 59%, 33.9% 20.2%, 73.6% 71.7%)",
            }}
          />
        </div>

        <div className="flex max-w-2xl flex-col-reverse gap-16 bg-inherit px-6 py-16 ring-0 ring-black/10 dark:ring-white/10 max-lg:mx-auto sm:rounded-3xl sm:p-8 lg:max-w-none lg:flex-row lg:items-center lg:bg-zinc-200/90 lg:py-16 lg:ring-1 lg:dark:bg-white/5 xl:gap-x-20 xl:px-20">
          <Image
            src={aboutIMG}
            className="hidden w-full rounded-2xl object-cover shadow-xl xs:block xs:flex-none sm:h-96 lg:h-auto lg:max-w-sm"
            alt="about image"
            placeholder="blur"
            priority
          />
          <div className="w-full flex-auto max-sm:pt-10">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-wide text-black dark:text-neutral-200 sm:text-4xl">How It Works!</h2>
            <div className="flex flex-col gap-3 text-lg">
              {texts.map((i) => (
                <div key={i.id} className="flex items-center justify-start gap-2">
                  <CheckMark className="h-5 w-5 min-w-[2rem] text-green-500" />
                  <p className="relative leading-8 text-neutral-600 dark:text-neutral-300 sm:max-w-md lg:max-w-none">{i.text}</p>
                </div>
              ))}
            </div>
            <div className="flex max-w-lg items-center justify-center py-4 sm:ml-10">
              {button ? (
                button
              ) : (
                <Link
                  href="/"
                  className="focus-visible:ring-ring inline-flex items-center justify-center rounded-md bg-indigo-800 px-5 py-2 text-sm font-medium text-neutral-300 ring-offset-background transition-colors hover:bg-indigo-900 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  Return
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
