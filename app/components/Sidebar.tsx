"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Palette2, Sparkle, Widget5, Compass, Bookmark, Shapes, type IconWeight } from "reicon-react";

const CATEGORIES: { value: string; label: string, icon?: (weight: IconWeight) => React.ReactNode }[] = [
  // { value: "all", label: "All" },
  { value: "ai", label: "AI", icon: (w: IconWeight) => <Sparkle size={20} weight={w} /> },
  { value: "design", label: "Design", icon: (w: IconWeight) => <Palette2 size={20} weight={w} /> },
  { value: "ui-components", label: "UI Components", icon: (w: IconWeight) => <Widget5 size={20} weight={w} /> },
  { value: "icons", label: "Icons", icon: (w: IconWeight) => <Shapes size={20} weight={w} /> },
];

const NAV_ITEMS = [
  { href: "/", label: "Explore", icon: (w: IconWeight) => <Compass size={20} weight={w} /> },
  { href: "/?saved=1", label: "Saved Tools", icon: (w: IconWeight) => <Bookmark size={20} weight={w} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") || "");

  const isSavedView = searchParams.get("saved") === "1";
  const activeTag = searchParams.get("tag") || "";

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (q) params.set("q", q);
    else params.delete("q");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }, [q, searchParams, router]);

  const handleTagClick = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (tag === "all") params.delete("tag");
      else params.set("tag", tag);
      params.delete("page");
      params.delete("saved");
      router.push(`/?${params.toString()}`);
      setOpen(false);
    },
    [searchParams, router]
  );


  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b dark:border-white/10 border-gray-200 bg-background/80 backdrop-blur-sm px-4 py-3 lg:hidden">
        <Link href="/" className="text-2xl font-semibold tracking-tighter dark:text-white text-neutral-900 font-sans">
          mY Directory.
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-full dark:bg-white/10 bg-black/10 backdrop-blur-lg"
          aria-label="Toggle sidebar"
        >
          {open ? <X className="h-5 w-5 dark:text-white text-neutral-900" /> : <Menu className="h-5 w-5 dark:text-white text-neutral-900" />}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-0 z-40 flex flex-col border-x dark:border-white/10 border-gray-200 bg-background/80 backdrop-blur-sm transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 lg:bg-none lg:backdrop-blur-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b dark:border-white/10 border-gray-200 px-5 py-4">
          <Link href="/" className="text-3xl font-semibold tracking-tighter dark:text-white text-zinc-900 font-sans">
            mY Directory.
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full dark:bg-white/10 bg-black/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4 dark:text-white text-neutral-900" />
          </button>
        </div>

        <div className="border-b dark:border-white/10 border-gray-200 px-3 py-3">
          <div className="flex items-center gap-2 rounded-full dark:bg-white/5 bg-gray-100 px-3 py-2 ring-1 dark:ring-white/10 ring-gray-200 focus-within:dark:ring-white/30 focus-within:ring-gray-400">
            <Search className="h-4 w-4 shrink-0 dark:text-zinc-500 text-zinc-400" />
            
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search..."
              className="w-full bg-transparent text-sm dark:text-white text-zinc-900 placeholder-zinc-500 outline-none font-sans"
            />
          </div>
        </div>

        <nav className="border-b dark:border-white/10 border-gray-200 px-3 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href.includes("saved")
              ? isSavedView
              : pathname === "/" && !isSavedView && !activeTag;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors font-sans my-1 ${
                  isActive
                    ? "dark:bg-white/10 dark:text-white bg-black/10 text-zinc-900 font-medium"
                    : "dark:text-zinc-400 text-zinc-500 dark:hover:text-white hover:text-zinc-900 dark:hover:bg-white/5 hover:bg-black/5"
                }`}
              >
                {item.icon(isActive ? "Filled" : "Outline")}
                {/* <Icon className="h-4 w-4" /> */}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <Accordion type="single" collapsible defaultValue="categories">
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="font-sans px-3 dark:text-zinc-500 text-zinc-600 dark:hover:text-zinc-300 hover:text-zinc-700 cursor-pointer">
                Categories
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleTagClick(cat.value)}
                      className={`cursor-pointer flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors font-sans ${
                        activeTag === cat.value
                          ? "dark:bg-white/10 dark:text-white bg-black/10 text-zinc-900 font-medium"
                          : "dark:text-zinc-400 text-zinc-500 dark:hover:text-white hover:text-zinc-900 dark:hover:bg-white/5 hover:bg-black/5"
                      }`}
                    >
                      {cat.icon?.(activeTag === cat.value ? "Filled" : "Outline")} {cat.label}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="border-t dark:border-white/10 border-gray-200 px-3 py-3">
          <ThemeToggle fullWidth />
        </div>
      </aside>
    </>
  );
}