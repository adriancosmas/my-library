import type { Metadata } from "next";
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
    <html lang="en" className="overflow-y-scroll">
      <body
        className={`${zalandoSans.variable} ${geistMono.variable} antialiased dark:bg-black bg-white text-white`}
      >
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
          <Sidebar />
          <main className="flex-1 min-h-screen pt-14 lg:pt-0">
              <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
