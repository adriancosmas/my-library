// Stateless share code: each slug becomes a 7-char base36 hash (FNV-1a, 32 bit) and the
// hashes are concatenated, so a list needs no server storage and stays short.
const WIDTH = 7

export function shortId(slug: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36).padStart(WIDTH, "0")
}

export function encodeShareList(slugs: string[]): string {
  return slugs.map(shortId).join("")
}

// Also accepts older links that carried comma-separated slugs.
export function shareListMatcher(code: string): (slug: string) => boolean {
  const tokens = new Set(code.split(","))
  for (let i = 0; i + WIDTH <= code.length; i += WIDTH) tokens.add(code.slice(i, i + WIDTH))
  return (slug) => tokens.has(slug) || tokens.has(shortId(slug))
}
