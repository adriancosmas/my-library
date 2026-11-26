"use client"

import { LayoutGrid, List } from "lucide-react"
import { useHtmlPref } from "@/lib/useHtmlPref"

type Transitioning = Document & { startViewTransition?: (update: () => void) => unknown }

const VIEWS = [
  { value: "grid", label: "Grid view", Icon: LayoutGrid },
  { value: "list", label: "List view", Icon: List },
] as const

// Grid/list segmented control; cards morph between layouts via the View Transitions API.
export function ViewSwitch() {
  const [view, setView] = useHtmlPref("view", "grid")

  const change = (next: string) => {
    if (next === view) return
    const doc = document as Transitioning
    if (!doc.startViewTransition || document.documentElement.dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches) setView(next)
    else doc.startViewTransition(() => setView(next))
  }

  return (
    <div role="group" aria-label="Layout" className="flex h-10 shrink-0 items-center rounded-full bg-secondary p-1">
      {VIEWS.map(({ value, label, Icon }) => (
        <button
          key={value}
          onClick={() => change(value)}
          aria-label={label}
          aria-pressed={view === value}
          className={`grid size-8 place-items-center rounded-full transition-colors ${
            view === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  )
}
