"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

const STORAGE_KEY = "saved-tools"

function getSaved(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

type SavedToolsContext = {
  saved: string[]
  toggle: (id: string) => void
  isSaved: (id: string) => boolean
}

const Ctx = createContext<SavedToolsContext | null>(null)

export function SavedToolsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>(getSaved)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSaved(getSaved())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const toggle = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isSaved = useCallback((id: string) => saved.includes(id), [saved])

  return <Ctx.Provider value={{ saved, toggle, isSaved }}>{children}</Ctx.Provider>
}

export function useSavedTools() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useSavedTools must be used within SavedToolsProvider")
  return ctx
}
