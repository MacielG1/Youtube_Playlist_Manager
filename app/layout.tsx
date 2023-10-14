import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/Toaster";
import ThemeProvider from "@/providers/ThemeProvider";
import SettingsMenu from "@/components/Settings/SettingsMenu";
import { Analytics } from "@vercel/analytics/react";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Youtube Playlist Manager",
  description: "Playlist Manager that helps you organize Youtube playlists and videos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} bg-background`}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            <SettingsMenu />
            <ToastProvider />
            <Analytics />
            {children}
          </ThemeProvider>
        </QueryProvider>
        <div id="modal-delete" />
        <div id="modal-settings" />
      </body>
    </html>
  );
}
