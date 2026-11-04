"use client"

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Library } from "@/lib/types";
import { Bookmark } from "lucide-react";
import { useSavedTools } from "@/lib/useSavedTools";
import { toast } from "sonner";

export default function LibraryCard({ lib }: { lib: Library }) {
  const rawTags = lib.tags
  const tags = rawTags.toSorted();
  const { isSaved, toggle } = useSavedTools();
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  const saved = mounted && isSaved(lib.id);

  const externalUrl = lib.website_url?.includes("?")
    ? `${lib.website_url}&ref=best-tools`
    : `${lib.website_url || "#"}?ref=best-tools`;

  return (
    <div className="group relative flex h-full flex-col gap-4 rounded-md bg-card p-5 transition-colors hover:bg-secondary">
      <a href={externalUrl} target="_blank" rel="noreferrer" className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-sm bg-white">
            {imgError || !lib.logo_url ? (
              <span className="text-base font-semibold text-neutral-700">{lib.name.charAt(0).toUpperCase()}</span>
            ) : (
              <Image
                loading="eager"
                src={lib.logo_url}
                alt={lib.name}
                width={30}
                height={30}
                unoptimized
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <h3 className="text-lg font-semibold leading-tight tracking-tight text-foreground">{lib.name}</h3>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{lib.description}</p>
      </a>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground group-hover:bg-background"
            >
              {t}
            </span>
          ))}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            const nowSaved = !saved;
            toggle(lib.id);
            toast(nowSaved ? "Tool bookmarked" : "Bookmark removed");
          }}
          className="-mr-2 -mb-2 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-background"
          aria-label={saved ? "Unsave tool" : "Save tool"}
          aria-pressed={saved}
        >
          <Bookmark className={`size-5 ${saved ? "fill-current text-foreground" : "text-muted-foreground"}`} />
        </button>
      </div>
    </div>
  );
}
