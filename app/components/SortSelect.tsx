"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ui } from "@/lib/ui"
import { ChevronDown } from "lucide-react"

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "A–Z" },
  { value: "popular", label: "Popular" },
]

export default function SortSelect({ value }: { value?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
      Sort
      <div className="relative">
      <select
        value={OPTIONS.some((o) => o.value === value) ? value : "newest"}
        onChange={(e) => {
          const params = new URLSearchParams(Array.from(searchParams.entries()))
          if (e.target.value === "newest") params.delete("sort")
          else params.set("sort", e.target.value)
          params.delete("page")
          const qs = params.toString()
          router.push(qs ? `/?${qs}` : "/")
        }}
        className={ui.select}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      </div>
    </label>
  )
}
