import { unstable_cache } from "next/cache";
import { getSupabaseClient } from "./supabaseClient";
import type { GithubRepo } from "./types";

// The view's column list is frozen when it was created, so newer columns may
// be absent; select "*" and fill gaps from github_url instead of erroring.
function normalize(r: GithubRepo): GithubRepo {
  const owner = r.github_url?.match(/github\.com\/([^/]+)/i)?.[1] ?? null;
  return {
    ...r,
    github_author: r.github_author ?? owner,
    github_stars: r.github_stars ?? null,
    subcategory: r.subcategory ?? null,
    logo_url: r.logo_url ?? (owner ? `https://github.com/${owner}.png?size=64` : null),
  };
}

// Throws on failure so unstable_cache never stores an error for the revalidate window.
const fetchRepos = unstable_cache(
  async (): Promise<GithubRepo[]> => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase env vars missing");
    // `libraries` has every GitHub column; the view only has the columns that
    // existed when it was created, so it is just a fallback.
    for (const table of ["libraries", "library_with_tags"]) {
      const { data, error } = await client
        .from(table)
        .select("*")
        .eq("framework", GITHUB_FRAMEWORK)
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) return (data as unknown as GithubRepo[]).map(normalize);
      if (table === "library_with_tags" && error) throw new Error(error.message);
    }
    return [];
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

export const GITHUB_FRAMEWORK = "GitHub Repository";
export const GITHUB_PAGE_SIZE = 9;
export const GITHUB_FALLBACK_GROUP = "Other";

export function repoGroup(r: GithubRepo): string {
  return r.subcategory?.trim() || GITHUB_FALLBACK_GROUP;
}
