import Link from "next/link"
import { SITE_BRAND } from "@/lib/site"

const LINKS = [
  { href: "/", label: "Directory" },
  { href: "/?saved=1", label: "Saved" },
  { href: "/submit", label: "Submit a tool" },
  { href: "/feedback", label: "Feedback" },
]

export default function Footer() {
  return (
    <footer className="mt-20 px-4 pb-8 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE_BRAND}. Hand-picked by{" "}
          <a href="https://cosmas.is-a.dev" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4">
            Cosmas
          </a>
          .
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
