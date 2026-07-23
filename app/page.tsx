import { Suspense } from "react";
import LibraryGrid from "./components/LibraryGrid";
import HighlightSection from "./components/HighlightSection";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SAMPLE_LIBRARIES } from "@/lib/sampleData";
import { getHighlights } from "@/lib/highlights";
import type { Library, LibraryFilters } from "@/lib/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default async function Home({
  searchParams,
}: {
  // Next.js 16: searchParams is a Promise
  searchParams?: Promise<LibraryFilters>;
}) {
  const params = await searchParams;
  const filters = params || {};
  const client = getSupabaseClient();
  const PAGE_SIZE = 15;
  let pageNum = 1;
  if (filters.page) {
    const parsed = Number(filters.page);
    if (Number.isFinite(parsed) && parsed > 0) pageNum = Math.floor(parsed);
  }
  const offset = (pageNum - 1) * PAGE_SIZE;

  let libraries: Library[] = [];
  let totalCount: number | null = null;
  let supabaseLoaded = false;

  if (client) {
    // Build Supabase query with optional filters
    // Prefer the view that includes `tags` array
    // Count query on view
    let countQuery = client
      .from("library_with_tags")
      .select("*", { count: "exact", head: true });
    if (filters.q) countQuery = countQuery.ilike("name", `%${filters.q}%`);
    if (filters.framework) countQuery = countQuery.eq("framework", filters.framework);
    const { count: viewCount } = await countQuery;
    if (typeof viewCount === "number") totalCount = viewCount;

    // Data query with pagination on view (latest first)
    let query = client
      .from("library_with_tags")
      .select("*")
      .order('created_at', { ascending: false });
    if (filters.q) query = query.ilike("name", `%${filters.q}%`);
    if (filters.framework) query = query.eq("framework", filters.framework);
    if (filters.saved !== "1" && !filters.tag) query = query.range(offset, offset + PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) {
      // Fallback gracefully if the view isn't available yet
      console.warn(
        "Supabase view missing, falling back to libraries:",
        error.message
      );
      // Build optional tag-based library id filter in fallback
      let tagLibIds: string[] | null = null;
      if (filters.tag) {
        const tag = filters.tag.toLowerCase();
        const { data: tagRow, error: tagFindError } = await client
          .from("tags")
          .select("id")
          .ilike("name", tag)
          .single();
        if (tagFindError) {
          console.warn("Fallback: tag lookup failed", tagFindError.message);
          tagLibIds = [];
        } else if (tagRow?.id) {
          const { data: ltRows, error: ltIdsError } = await client
            .from("library_tags")
            .select("library_id")
            .eq("tag_id", tagRow.id);
          if (ltIdsError) {
            console.warn("Fallback: library_ids by tag failed", ltIdsError.message);
            tagLibIds = [];
          } else {
            tagLibIds = Array.isArray(ltRows) ? ltRows.map((r: any) => String(r.library_id)) : [];
          }
        } else {
          tagLibIds = [];
        }
      }

      // Count on base table (apply q/framework and tag via id filter)
      let libCountQuery = client
        .from("libraries")
        .select("*", { count: "exact", head: true });
      if (filters.q) libCountQuery = libCountQuery.ilike("name", `%${filters.q}%`);
      if (filters.framework) libCountQuery = libCountQuery.eq("framework", filters.framework);
      if (tagLibIds) libCountQuery = libCountQuery.in("id", tagLibIds);
      const { count: libCount } = await libCountQuery;
      if (typeof libCount === "number") totalCount = libCount;

      let libQuery = client.from("libraries").select("*").order('created_at', { ascending: false });
      if (filters.q) libQuery = libQuery.ilike("name", `%${filters.q}%`);
      if (filters.framework) libQuery = libQuery.eq("framework", filters.framework);
      if (tagLibIds) libQuery = libQuery.in("id", tagLibIds);
      if (filters.saved !== "1") libQuery = libQuery.range(offset, offset + PAGE_SIZE - 1);
      const { data: libRows, error: libError } = await libQuery;
      if (libError) {
        console.error("Supabase fallback error", libError.message);
      } else if (libRows) {
        supabaseLoaded = true;
        const rows = libRows as any[];
        const libIds = rows.map((r) => r.id).filter(Boolean);

        // Fetch tags via relationship from library_tags -> tags
        let tagsByLib: Record<string, string[]> = {};
        if (libIds.length > 0) {
          const { data: ltRows, error: ltError } = await client
            .from("library_tags")
            .select("library_id, tags(name)")
            .in("library_id", libIds);
          if (ltError) {
            console.warn("Supabase tags fallback error", ltError.message);
          } else if (ltRows) {
            for (const row of ltRows as any[]) {
              const lid = String(row.library_id);
              const tagName = row?.tags?.name as string | undefined;
              if (tagName) {
                if (!tagsByLib[lid]) tagsByLib[lid] = [];
                if (!tagsByLib[lid].includes(tagName)) tagsByLib[lid].push(tagName);
              }
            }
          }
        }

        libraries = rows.map((row) => ({
          id: String(row.id),
          name: row.name,
          slug: row.slug,
          description: row.description,
          framework: row.framework,
          website_url: row.website_url,
          logo_url: row.logo_url,
          tags: tagsByLib[String(row.id)] || [],
        }));
      }
    } else if (data) {
      supabaseLoaded = true;
      libraries = (data as any[]).map((row) => ({
        id: String(row.id),
        name: row.name,
        slug: row.slug,
        description: row.description,
        framework: row.framework,
        website_url: row.website_url,
        logo_url: row.logo_url,
        tags: Array.isArray(row.tags) ? row.tags : [],
      }));
    }
  }

  // Client-side tag filter (case-insensitive)
  if (filters.tag && libraries.length > 0) {
    const tag = filters.tag.toLowerCase().replace(/-/g, " ");
    const all = libraries.filter((lib) =>
      lib.tags.some((t) => t.toLowerCase() === tag)
    );
    totalCount = all.length;
    libraries = filters.saved === "1" ? all : all.slice(offset, offset + PAGE_SIZE);
  }

  // Fallback to sample data when no Supabase env present
  if (!client || (!supabaseLoaded && libraries.length === 0)) {
    const filtered = SAMPLE_LIBRARIES.filter((lib) => {
      const matchesQ = filters.q
        ? lib.name.toLowerCase().includes(filters.q.toLowerCase())
        : true;
      const matchesFw = filters.framework && filters.framework !== "All"
        ? lib.framework === filters.framework
        : true;
      const matchesTag = filters.tag ? lib.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase().replace(/-/g, " ")) : true;
      return matchesQ && matchesFw && matchesTag;
    });
    totalCount = filtered.length;
    libraries = filters.saved === "1" ? filtered : filtered.slice(offset, offset + PAGE_SIZE);
  }

  const highlights = await getHighlights();

  const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / PAGE_SIZE)) : null;
  const baseParams = new URLSearchParams();
  if (filters.q) baseParams.set("q", filters.q);
  if (filters.framework && filters.framework !== "All") baseParams.set("framework", filters.framework);
  if (filters.tag) baseParams.set("tag", filters.tag.toLowerCase());
  const makeHref = (p: number) => {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(Math.max(1, p)));
    return `/?${params.toString()}`;
  };
  const safeTotal = totalPages ?? (libraries.length === PAGE_SIZE ? pageNum + 1 : pageNum);
  const hasPrev = pageNum > 1;
  const hasNext = pageNum < safeTotal;
  const getPages = (current: number, total: number) => {
    const pages: Array<number | "ellipsis"> = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) {
      pages.push("ellipsis");
    } else {
      pages.push(2);
    }
    if (current - 1 > 1 && current - 1 < total) pages.push(current - 1);
    if (current > 1 && current < total) pages.push(current);
    if (current + 1 > 1 && current + 1 < total) pages.push(current + 1);
    if (current < total - 2) {
      pages.push("ellipsis");
    } else {
      pages.push(total - 1);
    }
    pages.push(total);
    // Deduplicate consecutive numbers
    return pages.filter((v, i, arr) => (i === 0 ? true : v !== arr[i - 1]));
  };

  return (
    <div className="min-h-screen dark:bg-black bg-white">
        <div className="px-4 py-8 sm:px-6">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold dark:text-white text-neutral-900 tracking-tight font-sans sm:text-4xl">
            Just tons of libraries & tools to help your daily life
          </h2>

          <p className="mt-4 lg:mt-2 xl:mt-2 md:mt-2 text-sm text-zinc-400 font-sans font-light">
            curated by {' '}
            <span className="font-medium text-neutral-900 dark:text-white hover:text-yellow-400 transition-colors dark:hover:text-yellow-200 font-sans tracking-tight">
              <a href="https://cosmas.is-a.dev" target="_blank" rel="noopener noreferrer">
                Cosmas
              </a>
            </span>
          </p>
        </div>

        {filters.saved !== "1" && <HighlightSection highlights={highlights} />}

        <Suspense fallback={null}><LibraryGrid libraries={libraries} /></Suspense>

        {filters.saved !== "1" ? (
        <div className="mt-10">
          <Pagination className="text-sm">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={hasPrev ? makeHref(pageNum - 1) : undefined}
                  className={!hasPrev ? "pointer-events-none opacity-50 text-neutral-500 font-semibold font-sans" : undefined}
                />
              </PaginationItem>

              {getPages(pageNum, safeTotal).map((item, idx) => (
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink href={makeHref(item)} isActive={item === pageNum} className="font-sans">
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              
              <PaginationItem>
                <PaginationNext
                  href={hasNext ? makeHref(pageNum + 1) : undefined}
                  className={!hasNext ? "pointer-events-none opacity-50 text-neutral-500 font-semibold font-sans" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        ) : null}
      </div>
    </div>
  );
}
