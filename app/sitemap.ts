import type { MetadataRoute } from "next"
import { getAllLibraries, tagToParam } from "@/lib/libraries"
import { SITE_URL } from "@/lib/site"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const libs = await getAllLibraries()
  return [
    { url: SITE_URL, lastModified: libs[0]?.created_at ? new Date(libs[0].created_at) : undefined, changeFrequency: "daily", priority: 1 },
    ...[...new Set(libs.flatMap((l) => l.tags.map(tagToParam)))].map((tag) => ({
      url: `${SITE_URL}/tags/${tag}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...libs.map((l) => ({
      url: `${SITE_URL}/tools/${l.slug}`,
      lastModified: l.created_at ? new Date(l.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ]
}
