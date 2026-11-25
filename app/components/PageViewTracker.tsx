"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

// Fires once per client-side navigation. Skips Do Not Track and local dev.
export default function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (navigator.doNotTrack === "1" || location.hostname === "localhost") return
    const payload = JSON.stringify({ path: pathname, referrer: document.referrer })
    try {
      navigator.sendBeacon("/api/view", new Blob([payload], { type: "application/json" }))
    } catch {}
  }, [pathname])

  return null
}
