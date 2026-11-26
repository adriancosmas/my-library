// Display preferences. Each is mirrored on <html data-{name}>, saved in localStorage as pref-{name},
// and restored by the inline script in layout.tsx before first paint.
export const PREF_DEFAULTS = {
  view: "grid",
  vision: "off",
  accent: "yellow",
  motion: "full",
  font: "sans",
  corners: "round",
  text: "md",
  cards: "full",
  seen: "off",
} as const

export type PrefName = keyof typeof PREF_DEFAULTS
export const PREF_NAMES = Object.keys(PREF_DEFAULTS) as PrefName[]
