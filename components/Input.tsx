"use client";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toastError } from "@/utils/toastStyles";
import addLibraryItem from "@/utils/addLibraryItem";
import toast from "react-hot-toast";
import parseYouTubeInput from "@/utils/parseYouTubeInput";
import Search from "@/assets/icons/Search";
import Spin from "@/assets/icons/Spin";

export default function Input() {
  const [addedURL, setAddedURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const queryClient = useQueryClient();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAddedURL(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      setIsLoading(true);
      const inputValue = addedURL.trim();

      if (!inputValue) {
        toast.error("Please Enter a URL!", toastError);
        return;
      }

      const parsed = parseYouTubeInput(inputValue);
      if (parsed.type === "invalid") {
        toast.error("Please Enter a Valid URL or a Channel Name!", toastError);
        return;
      }

      const type = parsed.type === "channelName" ? "channel" : parsed.type;
      const result = await addLibraryItem(queryClient, type, parsed.id);
      setAddedURL("");

      if (result.status === "duplicate") {
        const label = result.type === "video" ? "Video" : result.type === "channel" ? "Channel" : "Playlist";
        toast.error(`${label} Already Added!`, toastError);
      }
      return;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, toastError);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  }

  return (
    <header className="sticky max-sm:pt-12">
      <nav className="xs:pt-3 relative top-0 z-20 w-full bg-inherit px-2 pb-5 sm:pt-4">
        <form className="flex max-h-12 justify-center gap-3" onSubmit={handleSubmit}>
          <div className="group relative w-[65vw] min-w-[16px] md:w-[480px]">
            <input
              type="text"
              value={addedURL}
              id="input"
              aria-label="Video or Playlist URL or Channel Name"
              onChange={handleInputChange}
              placeholder="Enter a Video or Playlist URL or Channel Name"
              className="xs:placeholder:text-base peer h-11 w-full rounded-xl border border-neutral-300 bg-white/80 px-4 pr-3 text-neutral-900 shadow-sm backdrop-blur-sm transition-all duration-200 placeholder:text-sm placeholder:text-neutral-400 hover:border-neutral-400 hover:bg-neutral-100 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none sm:text-base dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:focus:border-blue-500 dark:focus:bg-neutral-900 dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            aria-label="Search"
            className="group relative flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-linear-to-b from-blue-500 to-blue-600 text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-500 disabled:shadow-none dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 dark:focus:ring-offset-neutral-900 dark:disabled:from-neutral-700 dark:disabled:to-neutral-800"
          >
            <Search className="h-5 w-5 transition-transform duration-300 group-hover:scale-105" />
          </button>
        </form>
        {isLoading && (
          <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 items-center justify-center sm:-bottom-[0.35rem]">
            <Spin className="h-3 w-3 animate-spin text-blue-500 sm:h-4 sm:w-4" />
          </div>
        )}
      </nav>
    </header>
  );
}
