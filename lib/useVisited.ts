"use client"

import { useSyncExternalStore } from "react"

const KEY = "visited-tools"
const EVENT = "visited-change"

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener("storage", cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener("storage", cb)
  }
}
const read = () => {
  try { return localStorage.getItem(KEY) ?? "" } catch { return "" }
}

export function markVisited(id: string) {
  try {
    const ids = new Set<string>(JSON.parse(read() || "[]"))
    if (ids.has(id)) return
    ids.add(id)
    localStorage.setItem(KEY, JSON.stringify([...ids]))
    window.dispatchEvent(new Event(EVENT))
  } catch {}
}

export function useIsVisited(id: string) {
  const raw = useSyncExternalStore(subscribe, read, () => "")
  return raw.includes(`"${id}"`)
}
