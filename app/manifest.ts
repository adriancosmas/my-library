import type { MetadataRoute } from "next"
import { SITE_BRAND, SITE_DESCRIPTION } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_BRAND,
    short_name: SITE_BRAND,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#facc15",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }],
  }
}
