import type { Metadata } from "next"
import SubmitForm from "@/app/components/SubmitForm"
import { getAllLibraries, topTags } from "@/lib/libraries"

export const metadata: Metadata = {
  title: "Submit a tool",
  description: "Suggest a tool for the directory. Submissions are reviewed before they appear.",
  alternates: { canonical: "/submit" },
  robots: { index: false, follow: true },
}

export default async function SubmitPage() {
  const categories = topTags(await getAllLibraries(), 30)

  return (
    <div className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Submit a tool</h1>
        <p className="mt-2 text-muted-foreground">
          Know a tool that belongs here? Send it in. Submissions are reviewed before they appear in the directory.
        </p>
        <div className="mt-8">
          <SubmitForm categories={categories} />
        </div>
      </div>
    </div>
  )
}
