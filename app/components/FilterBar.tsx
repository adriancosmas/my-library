"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FRAMEWORKS, TAGS } from "@/lib/sampleData";

export default function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [framework, setFramework] = useState(
    searchParams.get("framework") || "All"
  );
  const [tag, setTag] = useState(searchParams.get("tag") || "All");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setFramework(searchParams.get("framework") || "All");
    setTag(searchParams.get("tag") || "All");
  }, [searchParams]);

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
        className="flex-1 rounded-md border border-white/10 bg-black/60 px-3 py-2 outline-none"
      />
      <select
        value={framework}
        onChange={(e) => {
          const value = e.target.value;
          setFramework(value);
          updateQuery({ framework: value });
        }}
        className="rounded-md border border-white/10 bg-black/60 px-3 py-2"
      >
        {FRAMEWORKS.map((fw) => (
          <option key={fw} value={fw}>
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
        className="rounded-md border border-white/10 bg-black/60 px-3 py-2"
      >
        {(["All", ...TAGS] as string[]).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <button
        onClick={() => updateQuery({ q })}
        className="rounded-md bg-white px-4 py-2 cursor-pointer text-neutral-900 font-semibold"
      >
        Search
      </button>
    </div>
  );
}