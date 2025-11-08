"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FRAMEWORKS, TAGS } from "@/lib/sampleData";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Search } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export default function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [framework, setFramework] = useState(searchParams.get("framework") || "All");
  const [tag, setTag] = useState(searchParams.get("tag") || "All");
  const [tagOptions, setTagOptions] = useState<string[]>(["All", ...TAGS]);
  const [frameworkOptions, setFrameworkOptions] = useState<string[]>(FRAMEWORKS);

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

    async function loadFrameworks() {
      if (!client) {
        if (!cancelled) setFrameworkOptions(FRAMEWORKS);
        return;
      }

      const { data, error } = await client.from("libraries").select("framework").order("framework", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.warn("Failed to fetch frameworks", error.message);
        setFrameworkOptions(FRAMEWORKS);
      } else {
        const names = Array.isArray(data) ? data.map((t: any) => String(t.framework)).filter(Boolean) : [];

        const unique = Array.from(new Set(names));

        setFrameworkOptions(["All", ...unique]);
      }
    }

    loadTags();
    loadFrameworks();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateQuery(next: { q?: string; }) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }

    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex w-full items-end gap-4 text-sm text-zinc-200 flex-col xl:flex-row lg:flex-row md:flex-row xl:pb-0 lg:pb-0 pb-6 md:pb-0">
      <div className="flex-2 rounded-md w-full">
        <InputGroup noRing className="dark:bg-black/60 dark:border-white/10 border shadow-none py-4.5">
          <InputGroupInput 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateQuery({ q })}
            placeholder="Search library name..."
            className="text-neutral-900 dark:text-white text-base font-sans font-light" />
          <InputGroupAddon>
            <Search className="mr-1"/>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex-1 flex-col items-start gap-2 justify-start w-full">
        <p className="pb-2 dark:text-white text-neutral-900 font-sans font-light">Framework</p>

        <select
          value={framework}
          onChange={(e) => {
            const value = e.target.value;
            setFramework(value);
            const params = new URLSearchParams(Array.from(searchParams.entries()));
            if (value && value !== "All") params.set("framework", value);
            else params.delete("framework");
            // Reset to first page when framework changes
            params.delete("page");
            router.push(`/?${params.toString()}`);
          }}
          className="w-full rounded-md  dark:bg-black/60 bg-white  px-3 py-2 text-neutral-900 dark:text-white cursor-pointer text-base outline-1 outline-black/10 dark:outline-white/10 border-r-12 border-transparent"
        >
          {frameworkOptions.map((fw) => (
            <option key={fw} value={fw} className="text-neutral-900 dark:text-white">
              {fw}
            </option>
          ))}
        </select>
      </div>
     
      <div className="flex-1 flex-col items-start gap-2 justify-start w-full">
        <p className="pb-2 dark:text-white text-neutral-900 font-sans font-light">Category</p>

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
          className="w-full rounded-md  dark:bg-black/60 bg-white px-3 py-2 text-neutral-900 dark:text-white cursor-pointer text-base outline-1 outline-black/10 dark:outline-white/10 border-r-12 border-transparent"
        >
          {tagOptions.map((t) => (
            <option key={t} value={t} className="text-neutral-900 dark:text-white">
              {t}
            </option>
          ))}
        </select>
      </div> 

      <button
        onClick={() => updateQuery({ q })}
        className="flex-1 rounded-md dark:bg-yellow-200 px-4 lg:py-1.5 xl:py-1.5 md:py-1.5 py-3 cursor-pointer text-neutral-900 font-semibold bg-yellow-400 text-base w-full font-sans"
      >
        Search
      </button>
    </div>
  );
}