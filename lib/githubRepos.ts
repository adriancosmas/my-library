import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "./supabaseClient";
import type { GithubRepo } from "./types";

const COLUMNS =
  "id, name, github_author, github_url, github_stars, subcategory, description, logo_url, og_image_url, created_at";

// Throws on failure so unstable_cache never stores an error for the revalidate window.
const fetchRepos = unstable_cache(
  async (): Promise<GithubRepo[]> => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase env vars missing");
    const { data, error } = await client
      .from("libraries")
      .select(COLUMNS)
      .eq("framework", "GitHub Repository")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as GithubRepo[];
  },
  ["github-repos"],
  { revalidate: 3600 }
);

export async function getGithubRepos(): Promise<{ repos: GithubRepo[]; error: boolean }> {
  try {
    return { repos: await fetchRepos(), error: false };
  } catch (e) {
    console.warn("getGithubRepos failed:", e instanceof Error ? e.message : e);
    return { repos: [], error: true };
  }
}

export const GITHUB_PAGE_SIZE = 9;
export const GITHUB_FALLBACK_GROUP = "Other";

export function repoGroup(r: GithubRepo): string {
  return r.subcategory?.trim() || GITHUB_FALLBACK_GROUP;
}
