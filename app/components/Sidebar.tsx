"use client";

import React, { useEffect, useRef, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { getCategoryIcon } from "./categoryIcons";
import { Spinner } from "@/components/ui/spinner";
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
  "flex h-10 w-full items-center gap-3 rounded-full px-4 text-left text-sm font-medium transition-all active:scale-[0.98]";
const itemIdle = "text-muted-foreground hover:bg-secondary hover:text-foreground";
const itemCurrent = "bg-primary text-primary-foreground";
const railBtn = "flex size-11 items-center justify-center rounded-full transition-all active:scale-90";

export default function Sidebar({ tags = [] }: { tags?: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [animate, setAnimate] = useState(false);
  const knownValues = new Set(CATEGORIES.map((c) => c.value));
  const categories: typeof CATEGORIES = [
    ...CATEGORIES,
    ...tags
      .map((t) => {
        const Icon = getCategoryIcon(t);
        return {
          value: t.toLowerCase().replace(/\s+/g, "-"),
          label: t,
          icon: (w: IconWeight) => <Icon size={20} weight={w} />,
        };
      })
      .filter((c) => !knownValues.has(c.value)),
  ];
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore the desktop collapsed state, then enable transitions so it does not animate on load.
  useEffect(() => {
    try { setCollapsed(localStorage.getItem("sidebar-collapsed") === "1"); } catch {}
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const toggleCollapsed = useCallback((next: boolean) => {
    setCollapsed(next);
    try { localStorage.setItem("sidebar-collapsed", next ? "1" : "0"); } catch {}
  }, []);

  // The sidebar content is hidden while collapsed; wait for it to become visible before focusing.
  const focusSearch = useCallback(() => {
    setOpen(true);
    toggleCollapsed(false);
    setTimeout(() => inputRef.current?.focus(), 180);
  }, [toggleCollapsed]);

  // "/" or Cmd/Ctrl+K focuses search from anywhere outside a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (!combo && (e.key !== "/" || typing || e.metaKey || e.ctrlKey || e.altKey)) return;
      e.preventDefault();
      focusSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusSearch]);

  const isSavedView = searchParams.get("saved") === "1";
  const activeTag = searchParams.get("tag") || "";
  const isGithubView = searchParams.get("github") === "1";

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const runSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      const term = value.trim();
      if (term) params.set("q", term);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.push(`/?${params.toString()}`));
    },
    [searchParams, router]
  );

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
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-full overflow-hidden border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          animate ? "lg:transition-[width,transform]" : "lg:transition-none"
        } ${collapsed ? "lg:w-16" : "lg:w-64"} ${open ? "translate-x-0" : "-translate-x-full max-lg:invisible"}`}
      >
        <div
          aria-hidden={!collapsed}
          className={`absolute inset-y-0 left-0 hidden w-16 flex-col items-center gap-2 py-5 lg:flex lg:transition-[opacity,visibility] lg:duration-300 ${
            collapsed ? "visible opacity-100 delay-150" : "invisible opacity-0"
          }`}
        >
          <button
            onClick={() => toggleCollapsed(false)}
            className={`${railBtn} bg-secondary text-foreground hover:bg-accent`}
            aria-label="Show sidebar"
          >
            <PanelLeftOpen className="size-5" />
          </button>
          <button onClick={() => focusSearch()} className={`${railBtn} ${itemIdle}`} aria-label="Search">
            <Search className="size-5" />
          </button>
          <Link
            href="/?saved=1"
            aria-label="Saved tools"
            aria-current={isSavedView ? "page" : undefined}
            className={`${railBtn} ${isSavedView ? itemCurrent : itemIdle}`}
          >
            <Bookmark size={20} weight={isSavedView ? "Filled" : "Outline"} />
          </Link>
          <div className="mt-auto">
            <ThemeToggle iconOnly />
          </div>
        </div>

        <div
          className={`flex h-full w-full flex-col duration-200 lg:w-64 lg:transition-[opacity,visibility] ${
            collapsed ? "lg:invisible lg:opacity-0" : "lg:visible lg:opacity-100 lg:delay-100"
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

          <button
            onClick={() => toggleCollapsed(true)}
            className="hidden size-11 items-center justify-center rounded-full bg-secondary text-foreground transition-all hover:bg-accent active:scale-90 lg:flex"
            aria-label="Hide sidebar"
          >
            <PanelLeftClose className="size-5" />
          </button>
        </div>

        <div className="px-3 pb-3">
          <div className="flex h-10 items-center gap-2 rounded-full bg-secondary px-4 transition-shadow focus-within:ring-2 focus-within:ring-primary">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />

            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!e.target.value) runSearch("");
              }}
              onKeyDown={(e) => e.key === "Enter" && runSearch(q)}
              placeholder="Search..."
              aria-keyshortcuts="/"
              aria-label="Search tools"
              className="h-8 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:outline-none"
            />

            {!q && !isPending && (
              <kbd className="hidden shrink-0 rounded bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:block" aria-hidden="true">/</kbd>
            )}
            {isPending && <Spinner className="size-4 shrink-0 text-muted-foreground" />}
            {q && !isPending && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  runSearch("");
                }}
                aria-label="Clear search"
                className="-mr-2 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-accent hover:text-foreground active:scale-90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            )}
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

        <div className="thin-scrollbar flex-1 overflow-y-auto px-3 py-2">
          <Accordion type="single" collapsible defaultValue="categories">
            <AccordionItem value="categories" className="border-b-0">
              <AccordionTrigger className="px-4">
                Categories
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleTagClick(cat.value)}
                      aria-current={activeTag === cat.value ? "true" : undefined}
                      className={`${itemBase} ${activeTag === cat.value ? itemCurrent : itemIdle}`}
                    >
                      {cat.icon?.(activeTag === cat.value ? "Filled" : "Outline")}
                      <span className="truncate">{cat.label}</span>
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
        </div>
      </aside>
    </>
  );
}
