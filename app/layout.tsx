import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import PageViewTracker from "./components/PageViewTracker";
import Providers from "./components/Providers";
import { SITE_URL, SITE_NAME, SITE_BRAND, SITE_DESCRIPTION } from "@/lib/site";
import { getAllLibraries, topTags } from "@/lib/libraries";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const DESCRIPTION = SITE_DESCRIPTION;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_BRAND,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  author: { "@type": "Person", name: "Cosmas", url: "https://cosmas.is-a.dev" },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_BRAND,
  title: { default: SITE_NAME, template: `%s | ${SITE_BRAND}` },
  description: DESCRIPTION,
  authors: [{ name: "Cosmas", url: "https://cosmas.is-a.dev" }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: { type: "website", siteName: SITE_BRAND, title: SITE_NAME, description: DESCRIPTION, url: "/", locale: "en_US" },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: DESCRIPTION },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
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
    <html lang="en" className="max-lg:overflow-y-scroll lg:h-full" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`
        }} />
      </head>
      <body className={`${inter.variable} antialiased lg:h-full lg:bg-frame`}>
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] lg:h-full lg:min-h-0 lg:overflow-hidden">
          <Suspense fallback={null}><Sidebar tags={tags} /></Suspense>
          <PageViewTracker />
          <main className="thin-scrollbar relative min-w-0 flex-1 min-h-screen pt-14 lg:m-1.5 lg:ml-0 lg:min-h-0 lg:overflow-y-auto lg:rounded-2xl lg:bg-background lg:pt-0">
              <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}
