import type { MetadataRoute } from "next"
import { getAllLibraries } from "@/lib/libraries"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const libs = await getAllLibraries()
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...libs.map((l) => ({
      url: `${SITE_URL}/tools/${l.slug}`,
      lastModified: l.created_at ? new Date(l.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
