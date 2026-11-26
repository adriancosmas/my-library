"use client"

import { useCallback, useSyncExternalStore } from "react"
import { PREF_NAMES, type PrefName } from "./prefs"

const listeners = new Set<() => void>()
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
const notify = () => listeners.forEach((l) => l())

export function useHtmlPref(name: PrefName, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset[name] ?? fallback,
    () => fallback,
  )
  const set = useCallback(
    (next: string) => {
      document.documentElement.dataset[name] = next
      try { localStorage.setItem(`pref-${name}`, next) } catch {}
      notify()
    },
    [name],
  )
  return [value, set] as const
}

export function resetPrefs() {
  for (const name of PREF_NAMES) {
    delete document.documentElement.dataset[name]
    try { localStorage.removeItem(`pref-${name}`) } catch {}
  }
  notify()
}
