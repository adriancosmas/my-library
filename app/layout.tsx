import type { Metadata } from "next";
import { Zalando_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${zalandoSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
