import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import LibraryCard from "@/app/components/LibraryCard"
import { getAllLibraries, tagToParam } from "@/lib/libraries"
import { SITE_URL, SITE_BRAND } from "@/lib/site"
import type { Library } from "@/lib/types"

export const revalidate = 3600

type Props = { params: Promise<{ tag: string }> }

async function getTag(param: string): Promise<{ label: string; libs: Library[] } | null> {
  const all = await getAllLibraries()
  const libs = all.filter((l) => l.tags.some((t) => tagToParam(t) === param))
  if (libs.length === 0) return null
  const label = libs[0].tags.find((t) => tagToParam(t) === param) ?? param
  return { label, libs }
}

export async function generateStaticParams() {
  const all = await getAllLibraries()
  return [...new Set(all.flatMap((l) => l.tags.map(tagToParam)))].map((tag) => ({ tag }))
}

const heading = (label: string) => (/tools?$/i.test(label) ? `${label} and resources` : `${label} tools and resources`)

function describe(label: string, libs: Library[]) {
  const names = libs.slice(0, 4).map((l) => l.name).join(", ")
  return `${libs.length} hand-picked ${label} ${libs.length === 1 ? "tool" : "tools"} on ${SITE_BRAND}, including ${names}.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const found = await getTag(tag)
  if (!found) return { title: "Category not found", robots: { index: false } }
  const title = heading(found.label)
  const description = describe(found.label, found.libs)
  return {
    title,
    description,
    alternates: { canonical: `/tags/${tag}` },
    openGraph: { type: "website", title, description, url: `/tags/${tag}` },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const found = await getTag(tag)
  if (!found) notFound()
  const { label, libs } = found
  const url = `${SITE_URL}/tags/${tag}`

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: heading(label),
      description: describe(label, libs),
      url,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: libs.length,
        itemListElement: libs.map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/tools/${l.slug}`,
          name: l.name,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Tools", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: label, item: url },
      ],
    },
  ]

  return (
    <div className="px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="size-4" /> All tools
      </Link>

      <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {heading(label)}
      </h1>
      <p className="mt-2 max-w-[65ch] text-muted-foreground">{describe(label, libs)}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {libs.map((l) => (
          <LibraryCard key={l.id} lib={l} />
        ))}
      </div>
    </div>
  )
}
