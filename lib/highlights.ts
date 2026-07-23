import { getSupabaseClient } from "./supabaseClient";
import { SAMPLE_HIGHLIGHTS } from "./sampleData";
import type { Highlight } from "./types";

export async function getHighlights(): Promise<Highlight[]> {
  const client = getSupabaseClient();

  if (!client) return SAMPLE_HIGHLIGHTS;

  const { data, error } = await client
    .from("highlights")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.warn("getHighlights error:", error?.message);
    return SAMPLE_HIGHLIGHTS;
  }

  const highlights = data as Highlight[];

  for (const h of highlights) {
    const { data: items } = await client
      .from("highlight_items")
      .select("*, library:libraries(id, name, slug, framework, logo_url, og_image_url, website_url)")
      .eq("highlight_id", h.id);

    h.items = (items as Highlight["items"]) ?? [];
  }

  return highlights;
}
