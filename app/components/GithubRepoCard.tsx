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
      className="group flex h-full flex-col gap-3 rounded-md border dark:border-white/10 border-black/10 dark:bg-black/30 bg-white p-4 transition-colors dark:hover:border-white/15 dark:hover:bg-white/7 hover:bg-gray-100/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:focus-visible:outline-white"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          {imgError || !repo.logo_url ? (
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {(owner || repo.name).charAt(0).toUpperCase()}
            </span>
          ) : (
            <Image
              src={repo.logo_url}
              alt=""
              width={32}
              height={32}
              unoptimized
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 dark:text-white font-sans">
          {label}
        </span>
      </div>

      <p className="line-clamp-2 flex-1 text-sm text-neutral-600 dark:text-zinc-300 font-sans font-light">
        {repo.description || "No description."}
      </p>

      <div className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
        <Star className="h-4 w-4" aria-hidden="true" />
        <span aria-label={`${repo.github_stars ?? 0} stars`}>{formatStars(repo.github_stars)}</span>
      </div>
    </a>
  );
}
