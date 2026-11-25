"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Bookmark, Link2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import LibraryCard from "./LibraryCard"
import { useSavedTools } from "@/lib/useSavedTools"
import type { Library } from "@/lib/types"

const pillBtn =
  "inline-flex h-9 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-95"

export default function LibraryGrid({ libraries }: { libraries: Library[] }) {
  const searchParams = useSearchParams()
  const { saved, saveMany } = useSavedTools()
  const [mounted, setMounted] = useState(false)
  const showSaved = searchParams.get("saved") === "1"
  const sharedSlugs = searchParams.get("list")?.split(",").filter(Boolean)
  const isShared = showSaved && Boolean(sharedSlugs?.length)

  useEffect(() => { setMounted(true) }, [])

  const filtered = !showSaved
    ? libraries
    : isShared
      ? libraries.filter((lib) => sharedSlugs!.includes(lib.slug))
      : mounted
        ? libraries.filter((lib) => saved.includes(lib.id))
        : []

  const share = async () => {
    const url = `${window.location.origin}/?saved=1&list=${filtered.map((l) => encodeURIComponent(l.slug)).join(",")}`
    try {
      await navigator.clipboard.writeText(url)
      toast("Share link copied")
    } catch {
      toast.error("Could not copy link")
    }
  }

  return (
    <>
      {showSaved && mounted && filtered.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {isShared ? `Shared list · ${filtered.length} tools` : `${filtered.length} saved`}
          </p>
          {isShared ? (
            <div className="flex gap-2">
              <button
                className={pillBtn}
                onClick={() => {
                  saveMany(filtered.map((l) => l.id))
                  toast("Added to your saved tools")
                }}
              >
                <Bookmark className="size-4" /> Save all
              </button>
              <Link href="/?saved=1" className={pillBtn}>My saved</Link>
            </div>
          ) : (
            <button className={pillBtn} onClick={share}>
              <Link2 className="size-4" /> Share list
            </button>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lib, i) => (
          <div
            key={lib.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
          >
            <LibraryCard lib={lib} />
          </div>
        ))}

        {mounted && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 rounded-md bg-card px-6 py-16 text-center">
            {showSaved && <Bookmark className="size-8 text-muted-foreground" aria-hidden />}
            <p className="text-sm font-medium text-foreground">
              {showSaved ? "No saved tools yet" : "No libraries found"}
            </p>
            {showSaved && (
              <>
                <p className="text-sm text-muted-foreground">Bookmark a tool and it shows up here.</p>
                <Link href="/" className="text-sm font-medium underline decoration-primary decoration-2 underline-offset-4">
                  Browse tools
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
