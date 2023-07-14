import "./globals.css";
import { Open_Sans } from "next/font/google";
import App from "@/components/App";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Youtube Playlist Manager",
  description: "Youtube Playlist Manager that helps organize your playlists and also videos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className}`}>
        <App>{children}</App>
        <div id="modal-root"> </div>
      </body>
    </html>
  );
}
