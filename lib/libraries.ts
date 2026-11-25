import { unstable_cache } from "next/cache"
import { getSupabaseClient } from "./supabaseClient"
import { GITHUB_FRAMEWORK } from "./githubRepos"
import { SAMPLE_LIBRARIES } from "./sampleData"
import type { Library } from "./types"

// Rows come from either `library_with_tags` (tags array) or `libraries` (no tags).
export function mapLibrary(row: any, tags?: string[]): Library {
  const rowTags: unknown = tags ?? row.tags
  return {
    id: String(row.id),
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    framework: row.framework,
    website_url: row.website_url ?? undefined,
    github_url: row.github_url ?? undefined,
    logo_url: row.logo_url ?? undefined,
    og_image_url: row.og_image_url ?? undefined,
    tags: Array.isArray(rowTags) ? rowTags.filter(Boolean) : [],
    created_at: row.created_at ?? undefined,
    click_count: typeof row.click_count === "number" ? row.click_count : undefined,
  }
}

export const tagToParam = (tag: string) => tag.toLowerCase().replace(/\s+/g, "-")

// Whole directory, cached: feeds sitemap, static params, tag chips and related tools.
export const getAllLibraries = unstable_cache(
  async (): Promise<Library[]> => {
    const client = getSupabaseClient()
    if (!client) return SAMPLE_LIBRARIES
    const { data, error } = await client
      .from("library_with_tags")
      .select("*")
      .neq("framework", GITHUB_FRAMEWORK)
      .order("created_at", { ascending: false })
    if (error || !data) {
      console.warn("getAllLibraries failed:", error?.message)
      return []
    }
    return data.map((r) => mapLibrary(r))
  },
  ["all-libraries"],
  { revalidate: 3600 }
)

export async function getLibraryBySlug(slug: string): Promise<Library | null> {
  const client = getSupabaseClient()
  if (!client) return SAMPLE_LIBRARIES.find((l) => l.slug === slug) ?? null
  // Read the base table: `library_with_tags` is frozen and lacks newer columns such as og_image_url.
  const { data, error } = await client
    .from("libraries")
    .select("*, library_tags(tags(name))")
    .eq("slug", slug)
    .neq("framework", GITHUB_FRAMEWORK)
    .maybeSingle()
  if (error) {
    console.warn("getLibraryBySlug failed:", error.message)
    return null
  }
  if (!data) return null
  const tags = ((data as any).library_tags ?? []).map((r: any) => r?.tags?.name).filter(Boolean)
  return mapLibrary(data, tags)
}

export function getRelated(lib: Library, all: Library[], limit = 3): Library[] {
  const mine = new Set(lib.tags.map((t) => t.toLowerCase()))
  return all
    .filter((l) => l.id !== lib.id)
    .map((l) => ({ l, score: l.tags.filter((t) => mine.has(t.toLowerCase())).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.l)
}

export function topTags(all: Library[], limit = 12): string[] {
  const counts = new Map<string, number>()
  for (const l of all) for (const t of l.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([t]) => t)
}
