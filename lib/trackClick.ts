// Fire-and-forget outbound click count; once per tool per browser session.
export function trackClick(id: string) {
  try {
    const key = `clicked:${id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, "1")
    const body = new Blob([JSON.stringify({ id })], { type: "application/json" })
    navigator.sendBeacon("/api/click", body)
  } catch {}
}
