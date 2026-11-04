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
import { Palette2, Sparkle, Widget5, Compass, Bookmark, Shapes, Code2, type IconWeight } from "reicon-react";

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

const itemBase =
  "flex h-10 w-full items-center gap-3 rounded-full px-4 text-left text-sm font-medium transition-colors";
const itemIdle = "text-muted-foreground hover:bg-secondary hover:text-foreground";
const itemCurrent = "bg-primary text-primary-foreground";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") || "");

  const isSavedView = searchParams.get("saved") === "1";
  const activeTag = searchParams.get("tag") || "";
  const isGithubView = searchParams.get("github") === "1";

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

  const handleGithubClick = useCallback(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    params.set("github", "1");
    router.push(`/?${params.toString()}`);
    setOpen(false);
  }, [searchParams, router]);

  const handleTagClick = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (tag === "all") params.delete("tag");
      else params.set("tag", tag);
      params.delete("page");
      params.delete("saved");
      params.delete("github");
      params.delete("gpage");
      params.delete("sub");
      router.push(`/?${params.toString()}`);
      setOpen(false);
    },
    [searchParams, router]
  );


  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          mY Directory.
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
          aria-label="Toggle sidebar"
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-full flex-col border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full max-lg:invisible"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground">
            mY Directory.
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="flex size-11 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <div className="flex h-10 items-center gap-2 rounded-full bg-secondary px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search..."
              aria-label="Search tools"
              className="h-8 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        <nav className="space-y-1 px-3 py-2" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href.includes("saved")
              ? isSavedView
              : pathname === "/" && !isSavedView && !activeTag && !isGithubView;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`${itemBase} ${isActive ? itemCurrent : itemIdle}`}
              >
                {item.icon(isActive ? "Filled" : "Outline")}
                {/* <Icon className="h-4 w-4" /> */}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <Accordion type="single" collapsible defaultValue="categories">
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="px-4">
                Categories
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleTagClick(cat.value)}
                      aria-current={activeTag === cat.value ? "true" : undefined}
                      className={`${itemBase} ${activeTag === cat.value ? itemCurrent : itemIdle}`}
                    >
                      {cat.icon?.(activeTag === cat.value ? "Filled" : "Outline")} {cat.label}
                    </button>
                  ))}
                  <button
                    onClick={handleGithubClick}
                    aria-current={isGithubView ? "page" : undefined}
                    className={`${itemBase} ${isGithubView ? itemCurrent : itemIdle}`}
                  >
                    <Code2 size={20} weight={isGithubView ? "Filled" : "Outline"} /> Github Repository
                  </button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="border-t border-border px-3 py-3">
          <ThemeToggle fullWidth />
        </div>
      </aside>
    </>
  );
}
