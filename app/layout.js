import "./globals.css";
import { Open_Sans } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/Toaster";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Youtube Playlist Manager",
  description: "Youtube Playlist Manager that helps organize your playlists and also videos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className}`}>
        <ToastProvider />
        <QueryProvider>{children}</QueryProvider>
        <div id="modal-root"> </div>
      </body>
    </html>
  );
}
