import type { Metadata } from "next";
import { Suspense } from "react";
import { Zalando_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Providers from "./components/Providers";

const zalandoSans = Zalando_Sans({  
  variable: "--font-zalando-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cosmas's Tools Directory",
  description: "A directory of tools and resources curated by Cosmas.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-y-scroll" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
        }} />
      </head>
      <body
        className={`${zalandoSans.variable} ${geistMono.variable} antialiased dark:bg-black bg-white text-white`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
          <Suspense fallback={null}><Sidebar /></Suspense>
          <main className="flex-1 min-h-screen pt-14 lg:pt-0">
              <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
