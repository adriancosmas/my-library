import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight, ChevronLeft, Star } from "lucide-react"
import GithubRepoCard from "@/app/components/GithubRepoCard"
import SaveButton from "@/app/components/SaveButton"
import ToolScreenshot from "@/app/components/ToolScreenshot"
import { formatStars, getGithubRepoBySlug, getGithubRepos, repoGroup } from "@/lib/githubRepos"
import { SITE_URL, SITE_BRAND } from "@/lib/site"

export const revalidate = 3600

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const { repos } = await getGithubRepos()
  return repos.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const repo = await getGithubRepoBySlug(slug)
  if (!repo) return { title: "Repository not found", robots: { index: false } }
  const description = repo.description || `${repo.name} on ${SITE_BRAND}.`
  const title = `${repo.name} — ${repoGroup(repo)} repository`
  return {
    title,
    description,
    alternates: { canonical: `/repos/${repo.slug}` },
    openGraph: { type: "article", title, description, url: `/repos/${repo.slug}`, ...(repo.og_image_url ? { images: [repo.og_image_url] } : {}) },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function RepoPage({ params }: Props) {
  const { slug } = await params
  const repo = await getGithubRepoBySlug(slug)
  if (!repo) notFound()

  const { repos } = await getGithubRepos()
  const group = repoGroup(repo)
  const related = repos.filter((r) => r.id !== repo.id && repoGroup(r) === group).slice(0, 3)
  const url = `${SITE_URL}/repos/${repo.slug}`
  const owner = repo.github_author ?? ""

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: repo.name,
      description: repo.description,
      url,
      ...(repo.github_url ? { codeRepository: repo.github_url, sameAs: [repo.github_url] } : {}),
      ...(owner ? { author: { "@type": "Person", name: owner } } : {}),
      ...(repo.created_at ? { datePublished: repo.created_at } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "GitHub Repositories", item: `${SITE_URL}/?github=1` },
        { "@type": "ListItem", position: 2, name: repo.name, item: url },
      ],
    },
  ]

  return (
    <article className="px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Link href="/?github=1" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ChevronLeft className="size-4" /> All repositories
      </Link>

      <header className="sticky top-14 z-20 -mx-4 mt-4 flex items-center gap-4 bg-background/80 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary">
          {repo.logo_url ? (
            <Image src={repo.logo_url} alt="" width={64} height={64} unoptimized />
          ) : (
            <span className="text-2xl font-semibold text-foreground">{(owner || repo.name).charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground">{repo.name}</h1>
          {owner && <p className="truncate text-sm text-muted-foreground">by {owner}</p>}
        </div>
        <SaveButton id={repo.id} noun="repository" />
        {repo.github_url && (
          <a
            href={repo.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            View on GitHub <ArrowUpRight className="size-4" />
          </a>
        )}
      </header>

      <ul className="mt-2 flex flex-wrap items-center gap-2" aria-label="Details">
        {(repo.tags?.length ? repo.tags : [group]).map((t, i) => {
          const chip = `rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            i === 0
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-secondary text-secondary-foreground"
          }`;
          return (
            <li key={t}>
              {i === 0 ? (
                <Link href={`/?github=1&sub=${encodeURIComponent(t)}#github-repos`} className={chip}>
                  {t}
                </Link>
              ) : (
                <span className={chip}>{t}</span>
              )}
            </li>
          );
        })}
        <li className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-4 fill-primary text-primary" aria-hidden="true" />
          <span className="tabular-nums">{formatStars(repo.github_stars)} stars</span>
        </li>
      </ul>

      <p className="mt-6 max-w-[65ch] text-base leading-7 text-muted-foreground">
        {repo.description || "No description."}
      </p>

      <ToolScreenshot src={repo.og_image_url ?? undefined} name={repo.name} />

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-[22px] font-semibold leading-7 tracking-tight text-foreground">
            More in {group}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <GithubRepoCard key={r.id} repo={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
