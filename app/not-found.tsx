import Link from "next/link"
import { Compass } from "lucide-react"
import EmptyState from "@/app/components/EmptyState"

export const metadata = { title: "Page not found", robots: { index: false, follow: true } }

export default function NotFound() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:py-24">
      <EmptyState
        className="mx-auto max-w-xl"
        icon={<Compass className="size-6" />}
        title="404, page not found"
        text="This page doesn't exist or the tool was removed. Head back to the directory to keep browsing."
      >
        <Link href="/" className="mt-2 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/85 active:scale-[0.97]">
          Back to directory
        </Link>
      </EmptyState>
    </div>
  )
}
