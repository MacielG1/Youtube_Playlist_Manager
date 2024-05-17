// import Input from "@/components/Input";
// import AllPlaylists from "@/components/AllPlaylists";

// export default function Home() {

//   return (
//     <>
//       <Input />
//       <AllPlaylists />
//     </>
//   );
// }
"use client";
import Input from "@/components/Input";
import AllPlaylists from "@/components/AllPlaylists";
import { useEffect, useState } from "react";
import About from "@/components/About";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";

export default function Home() {
  const [firstVisit, setFirstVisit] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const siteVisited = localStorage.getItem("siteVisited");
    const hasAnyVideoorPlaylist = Object.keys(localStorage).some((key) => key.startsWith("v=") || key.startsWith("pl="));

    if (!siteVisited && !hasAnyVideoorPlaylist) {
      setFirstVisit(true);
    }
    localStorage.setItem("siteVisited", "true");
  }, []);

  const startButton = (
    <Button
      onClick={() => {
        setFirstVisit(false);
        router.push("/");
      }}
      className="focus-visible:ring-ring inline-flex items-center justify-center rounded-md bg-indigo-800 px-5 py-2 text-sm font-medium text-neutral-300 ring-offset-background transition-colors hover:bg-indigo-900 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-indigo-800 dark:hover:bg-indigo-900"
    >
      Start
    </Button>
  );

  if (firstVisit) {
    return (
      <>
        <About button={startButton} />
      </>
    );
  }

  return (
    <>
      <Input />
      <AllPlaylists />
    </>
  );
}
