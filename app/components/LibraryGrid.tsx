"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Bookmark, ChevronDown, Link2, Search, SearchX, X } from "lucide-react"
import { useState, useSyncExternalStore } from "react"
import { toast } from "sonner"
import LibraryCard from "./LibraryCard"
import GithubRepoCard from "./GithubRepoCard"
import EmptyState from "./EmptyState"
import { ViewSwitch } from "./PrefToggles"
import { useSavedTools } from "@/lib/useSavedTools"
import { repoGroup } from "@/lib/githubRepos"
import { ui } from "@/lib/ui"
import { encodeShareList, shareListMatcher } from "@/lib/shareCode"
import type { GithubRepo, Library } from "@/lib/types"

type Kind = "all" | "tools" | "repos"

const subscribe = () => () => {}

const repoTags = (r: GithubRepo) => (r.tags?.length ? r.tags : [repoGroup(r)])

export default function LibraryGrid({ libraries, repos = [] }: { libraries: Library[]; repos?: GithubRepo[] }) {
  const searchParams = useSearchParams()
  const { saved, saveMany } = useSavedTools()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const [text, setText] = useState("")
  const [kind, setKind] = useState<Kind>("all")
  const [category, setCategory] = useState("")
  const shareCode = searchParams.get("list")?.trim() || ""
  const inSharedList = shareListMatcher(shareCode)
  const showSaved = searchParams.get("saved") === "1" || Boolean(shareCode)
  const query = searchParams.get("q")?.trim()
  const isShared = Boolean(shareCode)

  const savedLibs = !showSaved
    ? libraries
    : isShared
      ? libraries.filter((lib) => inSharedList(lib.slug))
      : mounted
        ? libraries.filter((lib) => saved.includes(lib.id))
        : []
  const savedRepos = !showSaved
    ? []
    : isShared
      ? repos.filter((r) => inSharedList(r.slug))
      : mounted
        ? repos.filter((r) => saved.includes(r.id))
        : []
  const savedTotal = savedLibs.length + savedRepos.length

  const categories = [...new Set([...savedLibs.flatMap((l) => l.tags), ...savedRepos.flatMap(repoTags)])].sort((a, b) =>
    a.localeCompare(b),
  )

  const needle = text.trim().toLowerCase()
  const filtered = !showSaved
    ? libraries
    : kind === "repos"
      ? []
      : savedLibs.filter(
          (l) =>
            (!category || l.tags.includes(category)) &&
            (!needle || [l.name, l.description].some((v) => v?.toLowerCase().includes(needle))),
        )
  const filteredRepos =
    kind === "tools"
      ? []
      : savedRepos.filter(
          (r) =>
            (!category || repoTags(r).includes(category)) &&
            (!needle || [r.name, r.github_author, r.description].some((v) => v?.toLowerCase().includes(needle))),
        )
  const total = filtered.length + filteredRepos.length
  const hasFilter = Boolean(needle || category || kind !== "all")

  const share = async () => {
    const code = encodeShareList([...savedLibs, ...savedRepos].map((l) => l.slug))
    const url = `${window.location.origin}/?list=${code}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Share link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }

  const grid = "view-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
  const fade = (i: number) => ({ animationDelay: `${Math.min(i, 8) * 30}ms` })
  const heading = "mt-8 text-[22px] font-semibold leading-7 tracking-tight text-foreground"

  return (
    <>
      {showSaved && mounted && savedTotal > 0 && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isShared ? `Shared list · ${savedTotal} items` : `${savedTotal} saved`}
            </p>
            {isShared ? (
              <div className="flex gap-2">
                <button
                  className={ui.button}
                  onClick={() => {
                    saveMany([...savedLibs, ...savedRepos].map((l) => l.id))
                    toast.success("Added to your saved items")
                  }}
                >
                  <Bookmark className="size-4" /> Save all
                </button>
                <Link href="/?saved=1" className={ui.button}>My saved</Link>
              </div>
            ) : (
              <button className={ui.button} onClick={share}>
                <Link2 className="size-4" /> Share list
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className={`${ui.field} min-w-52 flex-1 sm:max-w-xs`}>
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                type="search"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search saved"
                aria-label="Search saved"
                className={ui.fieldInput}
              />
              {text && (
                <button
                  onClick={() => setText("")}
                  aria-label="Clear search"
                  className="grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {(["all", "tools", "repos"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`${ui.chip} ${kind === k ? ui.chipOn : ui.chipOff}`}
              >
                {k === "all" ? "All" : k === "tools" ? "Tools" : "GitHub"}
              </button>
            ))}

            {categories.length > 0 && (
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="Filter by category"
                  className={ui.select}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              </div>
            )}

            <div className="ml-auto"><ViewSwitch /></div>
          </div>
        </>
      )}

      {!showSaved && (
        <div className={`mt-6 ${grid}`}>
          {filtered.map((lib, i) => (
            <div key={lib.id} className="animate-fade-up" style={fade(i)}>
              <LibraryCard lib={lib} />
            </div>
          ))}
          {mounted && filtered.length === 0 && (
            <EmptyState
              variant="search"
              className="col-span-full"
              icon={<SearchX className="size-6" />}
              title={query ? `Nothing matches "${query}"` : "Nothing here yet"}
              text={query ? "Try fewer words or another spelling." : "No tools fit these filters."}
            >
              <Link href="/" className={ui.emptyAction}>
                {query ? "Clear search" : "Show all tools"}
              </Link>
            </EmptyState>
          )}
        </div>
      )}

      {showSaved && (
        <>
          {filtered.length > 0 && (
            <section aria-labelledby="saved-tools">
              <h2 id="saved-tools" className={heading}>Tools</h2>
              <div className={`mt-4 ${grid}`}>
                {filtered.map((lib, i) => (
                  <div key={lib.id} className="animate-fade-up" style={fade(i)}>
                    <LibraryCard lib={lib} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredRepos.length > 0 && (
            <section aria-labelledby="saved-repos">
              <h2 id="saved-repos" className={heading}>GitHub Repositories</h2>
              <div className={`mt-4 ${grid}`}>
                {filteredRepos.map((repo, i) => (
                  <div key={repo.id} className="animate-fade-up" style={fade(i)}>
                    <GithubRepoCard repo={repo} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {mounted && total === 0 && (
            <div className="mt-6">
              {savedTotal === 0 ? (
                <EmptyState
                  variant="shelf"
                  icon={<Bookmark className="size-6" />}
                  title="Your shelf is empty"
                  text="Tap the bookmark on any tool or repo and it lands here."
                >
                  <Link href="/" className={ui.emptyAction}>
                    Find something to save
                  </Link>
                </EmptyState>
              ) : (
                <EmptyState
                  variant="filtered"
                  icon={<SearchX className="size-6" />}
                  title="No match in your saved"
                  text="Change or clear the filters to see everything you saved."
                >
                  {hasFilter && (
                    <button
                      onClick={() => { setText(""); setKind("all"); setCategory("") }}
                      className={ui.emptyAction}
                    >
                      Clear filters
                    </button>
                  )}
                </EmptyState>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
