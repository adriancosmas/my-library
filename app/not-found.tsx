import Link from "next/link"
import { Compass } from "lucide-react"
import { ui } from "@/lib/ui"
import EmptyState from "@/app/components/EmptyState"

export const metadata = { title: "Page not found", robots: { index: false, follow: true } }

export default function NotFound() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:py-24">
      <EmptyState
        variant="lost"
        className="mx-auto max-w-5xl"
        icon={<Compass />}
        title="You took a wrong turn"
        text="This page is gone or never existed. The directory is one tap away."
      >
        <Link href="/" className={ui.emptyAction}>
          Back to the directory
        </Link>
      </EmptyState>
    </div>
  )
}
