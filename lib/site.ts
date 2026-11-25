// Set NEXT_PUBLIC_SITE_URL to the production origin (no trailing slash).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "")

export const SITE_NAME = "Cosmas's Tools Directory"
