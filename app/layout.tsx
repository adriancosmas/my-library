import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Providers from "./components/Providers";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getAllLibraries, topTags } from "@/lib/libraries";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION = "A directory of tools and resources curated by Cosmas.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  openGraph: { type: "website", siteName: SITE_NAME, title: SITE_NAME, description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tags = topTags(await getAllLibraries(), 12);

  return (
    <html lang="en" className="overflow-y-scroll" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
        }} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
          <Suspense fallback={null}><Sidebar tags={tags} /></Suspense>
          <main className="flex-1 min-h-screen pt-14 lg:pt-0">
              <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
