"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

type Status = "idle" | "sending" | "done"

export default function FeedbackForm() {
  const pathname = usePathname()
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = { ...Object.fromEntries(new FormData(form)), path: pathname }
    setStatus("sending")
    setError("")
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Something went wrong. Try again.")
      }
      form.reset()
      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.")
      setStatus("idle")
    }
  }

  return (
    <>
    {status === "done" ? (
      <div className="space-y-4 py-2">
        <p className="text-sm text-foreground">Thanks! Your feedback was sent.</p>
        <Button className="rounded-full" onClick={() => setStatus("idle")}>Send another</Button>
      </div>
    ) : (
      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="feedback-message" className="block text-sm font-medium leading-none">Message</label>
          <Textarea id="feedback-message" name="message" className="min-h-36" required minLength={3} maxLength={2000} rows={5} placeholder="What's on your mind?" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="feedback-email" className="block text-sm font-medium leading-snug">
            Email <span className="font-normal text-muted-foreground">(optional, if you want a reply)</span>
          </label>
          <Input id="feedback-email" name="email" type="email" maxLength={200} placeholder="you@example.com" />
        </div>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={status === "sending"} size="lg" className="mt-auto w-full rounded-full">
          {status === "sending" ? <Spinner className="size-4" /> : null}
          Send feedback
        </Button>
      </form>
    )}
    </>
  )
}
