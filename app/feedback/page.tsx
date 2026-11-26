import type { Metadata } from "next"
import { Bug, Lightbulb, PlusCircle } from "lucide-react"
import FeedbackForm from "@/app/components/FeedbackForm"

export const metadata: Metadata = {
  title: "Send feedback",
  description: "Report a bug, share an idea, or suggest a tool for the directory.",
  alternates: { canonical: "/feedback" },
  robots: { index: false, follow: true },
}

const TOPICS = [
  { icon: Bug, title: "Report a bug", text: "Something broken, slow or confusing? Say what you did and what happened." },
  { icon: Lightbulb, title: "Share an idea", text: "A feature or change that would make the directory more useful to you." },
  { icon: PlusCircle, title: "Suggest a tool", text: "Send the name and link of a tool that belongs here, with a line on why." },
]

export default function FeedbackPage() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <section>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Help shape the directory
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Every message is read. No account needed, and your email is only used if you want a reply.
          </p>

          <ul className="mt-8 space-y-5">
            {TOPICS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Feedback form" className="flex flex-col rounded-xl bg-card p-5 sm:p-7">
          <FeedbackForm />
        </section>
      </div>
    </div>
  )
}
