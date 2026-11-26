import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight, ChevronLeft } from "lucide-react"
import LibraryCard from "@/app/components/LibraryCard"
import VisitLink from "@/app/components/VisitLink"
import SaveButton from "@/app/components/SaveButton"
import ToolScreenshot from "@/app/components/ToolScreenshot"
import { getAllLibraries, getLibraryBySlug, getRelated, tagToParam } from "@/lib/libraries"
import { SITE_URL, SITE_BRAND } from "@/lib/site"
import { withRef } from "@/lib/utils"

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const all = await getAllLibraries()
  return all.map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lib = await getLibraryBySlug(slug)
  if (!lib) return { title: "Tool not found", robots: { index: false } }
  const description = lib.description || `${lib.name} on ${SITE_BRAND}.`
  const title = `${lib.name}${lib.tags[0] ? ` — ${lib.tags[0]} tool` : ""}`
  return {
    title,
    description,
    alternates: { canonical: `/tools/${lib.slug}` },
    openGraph: { type: "article", title, description, url: `/tools/${lib.slug}` },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params
  const lib = await getLibraryBySlug(slug)
  if (!lib) notFound()

  const related = getRelated(lib, await getAllLibraries())
  const url = `${SITE_URL}/tools/${lib.slug}`

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: lib.name,
      description: lib.description,
      url,
      applicationCategory: "DeveloperApplication",
      keywords: lib.tags.join(", "),
      ...(lib.logo_url?.startsWith("http") ? { image: lib.logo_url } : {}),
      ...(lib.created_at ? { datePublished: lib.created_at } : {}),
      sameAs: [lib.website_url, lib.github_url].filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Tools", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: lib.name, item: url },
      ],
    },
  ]

  return (
    <article className="px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="size-4" /> All tools
      </Link>

      <header className="sticky top-14 z-20 -mx-4 mt-4 flex items-center gap-4 bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <div className="grid size-16 shrink-0 place-items-center rounded-md bg-white/10">
          {lib.logo_url ? (
            <Image src={lib.logo_url} alt="" width={44} height={44} unoptimized />
          ) : (
            <span className="text-2xl font-semibold text-foreground">{lib.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h1 className="min-w-0 flex-1 text-balance text-3xl font-bold tracking-tight text-foreground">{lib.name}</h1>
        <SaveButton id={lib.id} noun="tool" />
        {lib.website_url && (
          <VisitLink
            id={lib.id}
            href={withRef(lib.website_url)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            Visit website <ArrowUpRight className="size-4" />
          </VisitLink>
        )}
      </header>

      {lib.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label="Tags">
          {lib.tags.map((t) => (
            <li key={t}>
              <Link
                href={`/tags/${tagToParam(t)}`}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
              >
                {t}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 max-w-[65ch] text-base leading-7 text-muted-foreground">{lib.description}</p>

      <ToolScreenshot src={lib.og_image_url} name={lib.name} />

      {lib.github_url && (
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={lib.github_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-secondary px-6 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-95"
          >
            GitHub
          </a>
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
            Similar tools
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <LibraryCard key={r.id} lib={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
