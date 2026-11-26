// Set NEXT_PUBLIC_SITE_URL to the production origin (no trailing slash).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "")

export const SITE_NAME = "mY Directory | Your resource directory is here now"

// Short brand for title suffixes and share cards; SITE_NAME is the longer homepage title.
export const SITE_BRAND = "mY Directory"

export const SITE_DESCRIPTION =
  "A curated directory of free tools, design resources, UI components, icons, AI tools and open source projects, hand-picked by Cosmas."
