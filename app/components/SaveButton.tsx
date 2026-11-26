"use client"

import { useSyncExternalStore } from "react"
import { Bookmark } from "lucide-react"
import { toast } from "sonner"
import { useSavedTools } from "@/lib/useSavedTools"

const subscribe = () => () => {}

export default function SaveButton({ id, noun }: { id: string; noun: "tool" | "repository" }) {
  const { isSaved, toggle } = useSavedTools()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const saved = mounted && isSaved(id)

  return (
    <button
      onClick={() => {
        toggle(id)
        if (saved) toast.error("Bookmark removed")
        else toast.success(`${noun === "tool" ? "Tool" : "Repository"} bookmarked`)
      }}
      aria-label={saved ? `Unsave ${noun}` : `Save ${noun}`}
      aria-pressed={saved}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-95"
    >
      <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
    </button>
  )
}
