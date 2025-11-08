import FilterBar from "./components/FilterBar";
import LibraryCard from "./components/LibraryCard";
import Header from "./components/Header";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { SAMPLE_LIBRARIES } from "@/lib/sampleData";
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
  const PAGE_SIZE = 30;
  let pageNum = 1;
  if (filters.page) {
    const parsed = Number(filters.page);
    if (Number.isFinite(parsed) && parsed > 0) pageNum = Math.floor(parsed);
  }
  const offset = (pageNum - 1) * PAGE_SIZE;

  let libraries: Library[] = [];
  let totalCount: number | null = null;

  if (client) {
    // Build Supabase query with optional filters
    // Prefer the view that includes `tags` array
    // Count query on view
    let countQuery = client
      .from("library_with_tags")
      .select("*", { count: "exact", head: true });
    if (filters.q) countQuery = countQuery.ilike("name", `%${filters.q}%`);
    if (filters.framework) countQuery = countQuery.eq("framework", filters.framework);
    if (filters.tag) countQuery = countQuery.contains("tags", [filters.tag]);
    const { count: viewCount } = await countQuery;
    if (typeof viewCount === "number") totalCount = viewCount;

    // Data query with pagination on view
    let query = client.from("library_with_tags").select("*");
    if (filters.q) query = query.ilike("name", `%${filters.q}%`);
    if (filters.framework) query = query.eq("framework", filters.framework);
    if (filters.tag) query = query.contains("tags", [filters.tag]);
    query = query.range(offset, offset + PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) {
      // Fallback gracefully if the view isn't available yet
      console.warn(
        "Supabase view missing, falling back to libraries:",
        error.message
      );
      // Count on base table (no tag filter in fallback)
      let libCountQuery = client
        .from("libraries")
        .select("*", { count: "exact", head: true });
      if (filters.q) libCountQuery = libCountQuery.ilike("name", `%${filters.q}%`);
      if (filters.framework) libCountQuery = libCountQuery.eq("framework", filters.framework);
      const { count: libCount } = await libCountQuery;
      if (typeof libCount === "number") totalCount = libCount;

      let libQuery = client.from("libraries").select("*").order('id', { ascending: false });
      if (filters.q) libQuery = libQuery.ilike("name", `%${filters.q}%`);
      if (filters.framework) libQuery = libQuery.eq("framework", filters.framework);
      libQuery = libQuery.range(offset, offset + PAGE_SIZE - 1);
      const { data: libRows, error: libError } = await libQuery;
      if (libError) {
        console.error("Supabase fallback error", libError.message);
      } else if (libRows) {
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

  // Fallback to sample data when no Supabase env present
  if (!client || libraries.length === 0) {
    const filtered = SAMPLE_LIBRARIES.filter((lib) => {
      const matchesQ = filters.q
        ? lib.name.toLowerCase().includes(filters.q.toLowerCase())
        : true;
      const matchesFw = filters.framework && filters.framework !== "All"
        ? lib.framework === filters.framework
        : true;
      const matchesTag = filters.tag ? lib.tags.includes(filters.tag) : true;
      return matchesQ && matchesFw && matchesTag;
    });
    totalCount = filtered.length;
    libraries = filtered.slice(offset, offset + PAGE_SIZE);
  }

  const totalPages = totalCount ? Math.max(1, Math.ceil(totalCount / PAGE_SIZE)) : null;
  const baseParams = new URLSearchParams();
  if (filters.q) baseParams.set("q", filters.q);
  if (filters.framework && filters.framework !== "All") baseParams.set("framework", filters.framework);
  if (filters.tag) baseParams.set("tag", filters.tag);
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
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-4xl font-semibold dark:text-white text-neutral-900 tracking-tight">
            Just tons of libraries & tools to help your daily
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            curated by Cosmas
          </p>
        </div>

        <FilterBar />
        
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libraries.map((lib) => (
            <LibraryCard key={lib.id} lib={lib} />
          ))}

          {libraries.length === 0 && (
            <div className="col-span-full rounded-xl border border-white/10 p-6 text-center text-zinc-400">
              No libraries found.
            </div>
          )}
        </div>

        <div className="mt-10">
          <Pagination className="text-sm">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={hasPrev ? makeHref(pageNum - 1) : undefined}
                  className={!hasPrev ? "pointer-events-none opacity-50 text-neutral-500 font-semibold" : undefined}
                />
              </PaginationItem>

              {getPages(pageNum, safeTotal).map((item, idx) => (
                item === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink href={makeHref(item)} isActive={item === pageNum}>
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              ))}
              
              <PaginationItem>
                <PaginationNext
                  href={hasNext ? makeHref(pageNum + 1) : undefined}
                  className={!hasNext ? "pointer-events-none opacity-50 text-neutral-500 font-semibold" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
    </div>
  );
}
