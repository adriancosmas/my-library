"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FRAMEWORKS, TAGS } from "@/lib/sampleData";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [framework, setFramework] = useState(
    searchParams.get("framework") || "All"
  );
  const [tag, setTag] = useState(searchParams.get("tag") || "All");
  const [tagOptions, setTagOptions] = useState<string[]>(["All", ...TAGS]);

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setFramework(searchParams.get("framework") || "All");
    setTag(searchParams.get("tag") || "All");
  }, [searchParams]);

  // Dynamically load tags from Supabase, with fallback to sample data
  useEffect(() => {
    let cancelled = false;
    const client = getSupabaseClient();
    async function loadTags() {
      if (!client) {
        if (!cancelled) setTagOptions(["All", ...TAGS]);
        return;
      }
      const { data, error } = await client.from("tags").select("name").order("name", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.warn("Failed to fetch tags", error.message);
        setTagOptions(["All", ...TAGS]);
      } else {
        const names = Array.isArray(data) ? data.map((t: any) => String(t.name)) : [];
        setTagOptions(["All", ...names]);
      }
    }
    loadTags();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateQuery(next: { q?: string; framework?: string }) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.framework !== undefined) {
      const value = next.framework;
      if (value && value !== "All") params.set("framework", value);
      else params.delete("framework");
    }
    // Reset to first page when filters change
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex w-full items-center gap-3 text-sm text-zinc-200">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && updateQuery({ q })}
        placeholder="Search library name..."
        className="flex-1 rounded-md border dark:border-white/10 dark:bg-black/60 bg-white border-black/10 px-3 py-2 outline-none text-neutral-900 dark:text-white"
      />
      <select
        value={framework}
        onChange={(e) => {
          const value = e.target.value;
          setFramework(value);
          updateQuery({ framework: value });
        }}
        className="rounded-md border dark:border-white/10 dark:bg-black/60 bg-white border-black/10 px-3 py-2 text-neutral-900 dark:text-white"
      >
        {FRAMEWORKS.map((fw) => (
          <option key={fw} value={fw} className="text-neutral-900 dark:text-white">
            {fw}
          </option>
        ))}
      </select>

      <select
        value={tag}
        onChange={(e) => {
          const value = e.target.value;
          setTag(value);
          const params = new URLSearchParams(Array.from(searchParams.entries()));
          if (value && value !== "All") params.set("tag", value);
          else params.delete("tag");
          // Reset to first page when tag changes
          params.delete("page");
          router.push(`/?${params.toString()}`);
        }}
        className="rounded-md border dark:border-white/10 dark:bg-black/60 bg-white border-black/10 px-3 py-2 text-neutral-900 dark:text-white"
      >
        {tagOptions.map((t) => (
          <option key={t} value={t} className="text-neutral-900 dark:text-white">
            {t}
          </option>
        ))}
      </select>

      <button
        onClick={() => updateQuery({ q })}
        className="rounded-md dark:bg-yellow-200 px-4 py-2 cursor-pointer text-neutral-900 font-semibold bg-yellow-400"
      >
        Search
      </button>
    </div>
  );
}