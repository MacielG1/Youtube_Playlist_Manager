import "./globals.css";
import { Open_Sans } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/Toaster";
import ThemeProvider from "@/providers/ThemeProvider";
import SettingsMenu from "@/components/Settings/SettingsMenu";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "Youtube Playlist Manager",
  description: "Playlist Manager that helps you organize Youtube playlists and videos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} `}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            <SettingsMenu />
            <ToastProvider />
            {children}
          </ThemeProvider>
        </QueryProvider>
        <div id="modal-root"> </div>
      </body>
    </html>
  );
}
