"use client";
import { toastError, toastSuccess } from "@/utils/toastStyles";
import addLibraryItem, { type AddItemType } from "@/utils/addLibraryItem";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/assets/icons/Loading";

export default function AddExternalItem({ searchParams }: { searchParams: { type: string; id: string } }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const result = await addLibraryItem(queryClient, searchParams.type as AddItemType, searchParams.id);
        if (cancelled) return;
        if (result.status === "duplicate") {
          const label = result.type === "video" ? "Video" : result.type === "channel" ? "Channel" : "Playlist";
          toast.error(`${label} Already Added!`, toastError);
        } else {
          const label = result.type === "video" ? "Video" : result.type === "channel" ? "Channel" : "Playlist";
          toast.success(`${label} Added!`, toastSuccess);
        }
      } catch (error) {
        console.log(error);
        if (!cancelled) toast.error("Something went wrong. Please try again later.", toastError);
      } finally {
        if (!cancelled) router.push("/");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [queryClient, router, searchParams.id, searchParams.type]);

  return (
    <div className="flex min-h-[10vh] w-full items-center justify-center gap-2">
      <span className="text-base tracking-wide text-indigo-100">Adding Item</span>
      <Loading className="h-6 w-6 text-indigo-500" />
    </div>
  );
}
