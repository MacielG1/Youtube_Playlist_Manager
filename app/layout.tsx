import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import ToastProvider from "@/providers/Toaster";
import ThemeProvider from "@/providers/ThemeProvider";
import SettingsMenu from "@/components/Settings/SettingsMenu";
import { Analytics } from "@vercel/analytics/react";
import ScrollToTop from "@/components/ScrollToTop";
import SettingsProvider from "@/providers/SettingsProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Script from "next/script";

const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Youtube Playlist Manager",
  description: "Playlist Manager that helps you organize Youtube playlists and videos",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        async
        strategy="lazyOnload"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_PUB}`}
        crossOrigin="anonymous"
      />
       {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
        />  */}
      <body className={`${font.className} bg-background`}>
        <ErrorBoundary>
          <QueryProvider>
            <SettingsProvider>
              <ThemeProvider attribute="class" defaultTheme="system">
                <div className="fixed top-0 left-0 z-20 h-12 w-full bg-background" />
                <SettingsMenu />
                <ToastProvider />
                <Analytics />
                <ScrollToTop />
                {children}
              </ThemeProvider>
            </SettingsProvider>
          </QueryProvider>
        </ErrorBoundary>
        <div id="modal-delete" />
        <div id="modal-settings" />
      </body>
    </html>
  );
}
