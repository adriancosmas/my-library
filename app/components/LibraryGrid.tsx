"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import LibraryCard from "./LibraryCard"
import { useSavedTools } from "@/lib/useSavedTools"
import type { Library } from "@/lib/types"

export default function LibraryGrid({ libraries }: { libraries: Library[] }) {
  const searchParams = useSearchParams()
  const { saved } = useSavedTools()
  const [mounted, setMounted] = useState(false)
  const showSaved = searchParams.get("saved") === "1"

  useEffect(() => { setMounted(true) }, [])

  const filtered = mounted && showSaved
    ? libraries.filter((lib) => saved.includes(lib.id))
    : libraries

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lib) => (
          <LibraryCard key={lib.id} lib={lib} />
        ))}

        {mounted && filtered.length === 0 && (
          <div className="col-span-full rounded-md border border-white/10 p-6 text-center text-zinc-400 font-sans">
            {showSaved ? "No saved tools yet." : "No libraries found."}
          </div>
        )}
      </div>
    </>
  )
}
