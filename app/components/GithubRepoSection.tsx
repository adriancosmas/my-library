import Link from "next/link";
import type { GithubRepo } from "@/lib/types";
import { GITHUB_PAGE_SIZE, repoGroup } from "@/lib/githubRepos";
import GithubRepoCard from "./GithubRepoCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

type Props = {
  repos: GithubRepo[];
  error: boolean;
  page: number;
  sub?: string;
  // Current URL params of the page; gpage/sub are overridden per link.
  params: URLSearchParams;
};

const chipBase =
  "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors";

export default function GithubRepoSection({ repos, error, page, sub, params }: Props) {
  const href = (overrides: { gpage?: number; sub?: string | null }) => {
    const p = new URLSearchParams(params);
    p.delete("gpage");
    if (overrides.sub !== undefined) {
      p.delete("sub");
      if (overrides.sub) p.set("sub", overrides.sub);
    }
    if (overrides.gpage && overrides.gpage > 1) p.set("gpage", String(overrides.gpage));
    const qs = p.toString();
    return `${qs ? `/?${qs}` : "/"}#github-repos`;
  };

  const groups = [...new Set(repos.map(repoGroup))].sort((a, b) => a.localeCompare(b));
  const filtered = sub ? repos.filter((r) => repoGroup(r) === sub) : repos;
  const totalPages = Math.max(1, Math.ceil(filtered.length / GITHUB_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const visible = filtered.slice((current - 1) * GITHUB_PAGE_SIZE, current * GITHUB_PAGE_SIZE);

  return (
    <section id="github-repos" className="mt-16 scroll-mt-20" aria-labelledby="github-repos-heading">
      <div className="mb-4">
        <h2
          id="github-repos-heading"
          className="text-[22px] font-semibold leading-7 tracking-tight text-foreground"
        >
          GitHub Repositories
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open source repos worth a star.
        </p>
      </div>

      {error ? (
        <p role="status" className="text-sm text-destructive">
          Could not load repositories right now. Try again later.
        </p>
      ) : repos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No repositories yet.</p>
      ) : (
        <>
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filter by subcategory">
            {[null, ...groups].map((name) => {
              const selected = (sub ?? null) === name;
              return (
                <Link
                  key={name ?? "__all"}
                  href={href({ sub: name, gpage: 1 })}
                  scroll={false}
                  aria-current={selected ? "true" : undefined}
                  className={`${chipBase} ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                  }`}
                >
                  {name ?? "All"}
                </Link>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No repositories match.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((repo) => (
                <GithubRepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10">
              <Pagination className="text-sm">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={current > 1 ? href({ sub: undefined, gpage: current - 1 }) : undefined}
                      className={current <= 1 ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <PaginationItem key={n}>
                      <PaginationLink href={href({ gpage: n })} isActive={n === current} className="tabular-nums">
                        {n}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href={current < totalPages ? href({ sub: undefined, gpage: current + 1 }) : undefined}
                      className={current >= totalPages ? "pointer-events-none opacity-50" : undefined}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </section>
  );
}
