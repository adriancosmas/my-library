"use client";

import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";
import type { GithubRepo } from "@/lib/types";

function formatStars(n: number | null): string {
  const v = n ?? 0;
  if (v < 1000) return String(v);
  const k = v / 1000;
  return k < 10 ? `${Math.floor(k * 10) / 10}k` : `${Math.round(k)}k`;
}

export default function GithubRepoCard({ repo }: { repo: GithubRepo }) {
  const [imgError, setImgError] = useState(false);
  const owner = repo.github_author ?? "";
  const label = owner ? `${owner}/${repo.name}` : repo.name;

  return (
    <a
      href={repo.github_url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col gap-4 rounded-md bg-card p-5 transition-colors hover:bg-secondary"
    >
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
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {label}
        </span>
      </div>

      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
        {repo.description || "No description."}
      </p>

      <div className="mt-auto flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="size-4" aria-hidden="true" />
        <span className="tabular-nums" aria-label={`${repo.github_stars ?? 0} stars`}>{formatStars(repo.github_stars)}</span>
      </div>
    </a>
  );
}
