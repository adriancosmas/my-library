"use client"

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Library } from "@/lib/types";
import { Bookmark, ArrowUpRight } from "lucide-react";
import VisitLink from "./VisitLink";
import ClampedText from "./ClampedText";
import { withRef } from "@/lib/utils";
import { useSavedTools } from "@/lib/useSavedTools";
import { toast } from "sonner";
import { useIsVisited } from "@/lib/useVisited";

export default function LibraryCard({ lib }: { lib: Library }) {
  const rawTags = lib.tags
  const tags = rawTags.toSorted();
  const { isSaved, toggle } = useSavedTools();
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setMounted(true) }, []);

  const saved = mounted && isSaved(lib.id);
  const visited = useIsVisited(lib.id);

  return (
    <div data-visited={visited || undefined} style={{ viewTransitionName: `card-${lib.id}` }} className="group relative flex h-full flex-col gap-4 in-data-[view=list]:flex-row in-data-[view=list]:items-center rounded-md bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-secondary">
      <Link href={`/tools/${lib.slug}`} className="flex flex-1 flex-col gap-4 in-data-[view=list]:after:absolute in-data-[view=list]:after:inset-0 in-data-[view=list]:after:content-['']">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-sm bg-white/10">
            {imgError || !lib.logo_url ? (
              <span className="text-base font-semibold text-foreground">{lib.name.charAt(0).toUpperCase()}</span>
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

          <h3 className="min-w-0 break-words text-lg font-semibold leading-tight tracking-tight text-foreground">{lib.name}</h3>
        </div>

        <ClampedText text={lib.description} className="card-desc line-clamp-3 text-sm leading-6 text-muted-foreground" />
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 in-data-[view=list]:mt-0 in-data-[view=list]:shrink-0 in-data-[view=list]:max-w-[45%] in-data-[view=list]:flex-col-reverse in-data-[view=list]:items-end in-data-[view=list]:justify-between in-data-[view=list]:self-stretch">
        <div className="card-tags flex min-w-0 flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground group-hover:bg-background"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="-mr-2 ml-auto relative z-10 flex shrink-0 items-center">
          <VisitLink
            id={lib.id}
            href={withRef(lib.website_url)}
            aria-label={`Visit ${lib.name}`}
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-background hover:text-foreground active:scale-90"
          >
            <ArrowUpRight className="size-5" />
          </VisitLink>

        <button
          onClick={(e) => {
            e.preventDefault();
            const nowSaved = !saved;
            toggle(lib.id);
            if (nowSaved) toast.success("Tool bookmarked");
            else toast.error("Bookmark removed");
          }}
          className="flex size-11 shrink-0 items-center justify-center rounded-full transition-all hover:bg-background active:scale-90"
          aria-label={saved ? "Unsave tool" : "Save tool"}
          aria-pressed={saved}
        >
          <Bookmark className={`size-5 transition-transform duration-200 ${saved ? "scale-110" : ""} ${saved ? "fill-current text-foreground" : "text-muted-foreground"}`} />
        </button>
        </div>
      </div>
    </div>
  );
}
