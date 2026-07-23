"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Library } from "@/lib/types";
import { Bookmark } from "lucide-react";
import { useSavedTools } from "@/lib/useSavedTools";

export default function LibraryCard({ lib }: { lib: Library }) {
  const rawTags = lib.tags
  const tags = rawTags.toSorted();
  const { isSaved, toggle } = useSavedTools();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  const saved = mounted && isSaved(lib.id);

  return (
    <div className="group relative flex h-full flex-col gap-3 rounded-md border dark:border-white/10 border-black/10 dark:bg-black/30 p-4 transition-colors dark:hover:border-white/15 dark:hover:bg-white/7 hover:bg-gray-100/50">
      <a href={lib.website_url} target="_blank" rel="noreferrer" className="flex flex-1 flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-white/5">
            <Image
              loading="eager"
              src={lib.logo_url || "/next.svg"}
              alt={lib.name}
              width={30}
              height={30}
              unoptimized
              className="dark:invert-0"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-medium text-neutral-900 dark:text-white antialiased font-sans">{lib.name}</span>
            {/* <span className="text-sm text-zinc-400 leading-none font-sans dark:text-zinc-400 font-light pt-1">{lib.framework || "Tools"}</span> */}
          </div>
        </div>

        <p className="line-clamp text-sm text-neutral-600 dark:text-zinc-300 flex-1 py-6 font-sans font-light">{lib.description}</p>
      </a>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full border-0 border-neutral-100/70 dark:border-white/10 bg-black/5 dark:bg-white/10 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-300 font-sans font-light"
            >
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); toggle(lib.id); }}
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors dark:hover:bg-white/10 hover:bg-black/10"
          aria-label={saved ? "Unsave tool" : "Save tool"}
        >
          <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}