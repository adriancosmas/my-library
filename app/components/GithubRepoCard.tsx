"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Bookmark, Star } from "lucide-react";
import { toast } from "sonner";
import type { GithubRepo } from "@/lib/types";
import { formatStars } from "@/lib/githubRepos";
import { useSavedTools } from "@/lib/useSavedTools";
import ClampedText from "./ClampedText";
import { markVisited, useIsVisited } from "@/lib/useVisited";

const subscribe = () => () => {};

export default function GithubRepoCard({ repo }: { repo: GithubRepo }) {
  const [imgError, setImgError] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const { isSaved, toggle } = useSavedTools();

  const owner = repo.github_author ?? "";
  const label = owner ? `${owner}/${repo.name}` : repo.name;
  const saved = mounted && isSaved(repo.id);
  const visited = useIsVisited(repo.id);

  return (
    <div data-visited={visited || undefined} style={{ viewTransitionName: `card-${repo.id}` }} className="group relative flex h-full flex-col gap-4 in-data-[view=list]:flex-row in-data-[view=list]:items-center rounded-md bg-card p-5 transition-colors hover:bg-secondary">
      <Link href={`/repos/${repo.slug}`} className="flex min-w-0 flex-1 flex-col gap-4 in-data-[view=list]:after:absolute in-data-[view=list]:after:inset-0 in-data-[view=list]:after:content-['']">
        <div className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary group-hover:bg-background">
            {imgError || !repo.logo_url ? (
              <span className="text-base font-semibold text-muted-foreground">
                {(owner || repo.name).charAt(0).toUpperCase()}
              </span>
            ) : (
              <Image
                src={repo.logo_url}
                alt=""
                width={40}
                height={40}
                unoptimized
                onError={() => setImgError(true)}
              />
            )}
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{label}</span>
        </div>

        <ClampedText
          text={repo.description || "No description."}
          className="card-desc line-clamp-2 text-sm leading-6 text-muted-foreground"
        />
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2 in-data-[view=list]:mt-0 in-data-[view=list]:shrink-0 sm:in-data-[view=list]:gap-6 in-data-[view=list]:flex-col-reverse in-data-[view=list]:items-end in-data-[view=list]:justify-between in-data-[view=list]:self-stretch">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-4 fill-primary text-primary" aria-hidden="true" />
          <span className="tabular-nums" aria-label={`${repo.github_stars ?? 0} stars`}>
            {formatStars(repo.github_stars)}
          </span>
        </div>

        <div className="-mr-2 relative z-10 flex shrink-0 items-center">
          {repo.github_url && (
            <a
              href={repo.github_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => markVisited(repo.id)}
              aria-label={`Open ${label} on GitHub`}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-background hover:text-foreground active:scale-90"
            >
              <ArrowUpRight className="size-5" />
            </a>
          )}
          <button
            onClick={() => {
              toggle(repo.id);
              if (saved) toast.error("Bookmark removed");
              else toast.success("Repository bookmarked");
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-full transition-all hover:bg-background active:scale-90"
            aria-label={saved ? "Unsave repository" : "Save repository"}
            aria-pressed={saved}
          >
            <Bookmark
              className={`size-5 transition-transform duration-200 ${saved ? "scale-110 fill-current text-foreground" : "text-muted-foreground"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
