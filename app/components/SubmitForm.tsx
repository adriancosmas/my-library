"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

type Status = "idle" | "sending" | "done"

export default function SubmitForm({ categories }: { categories: string[] }) {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setStatus("sending")
    setError("")
    try {
      const res = await fetch("/api/submit", {
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
          <p className="text-sm text-foreground">Thanks! Your tool was sent for review.</p>
          <Button className="rounded-full" onClick={() => setStatus("idle")}>
            <Plus className="size-4" /> Submit another
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="submit-name" className="text-sm font-medium">Name</label>
            <Input id="submit-name" name="name" required maxLength={100} placeholder="Tool name" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="submit-url" className="text-sm font-medium">Website</label>
            <Input id="submit-url" name="url" required maxLength={300} inputMode="url" placeholder="https://example.com" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="submit-category" className="text-sm font-medium">Category</label>
            <Input id="submit-category" name="category" maxLength={50} list="submit-categories" placeholder="e.g. AI, Design" />
            <datalist id="submit-categories">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="submit-description" className="text-sm font-medium">Description</label>
            <Textarea id="submit-description" name="description" maxLength={500} rows={3} placeholder="What does it do?" />
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={status === "sending"} className="w-full rounded-full">
            {status === "sending" ? <Spinner className="size-4" /> : null}
            Submit for review
          </Button>
        </form>
      )}
    </>
  )
}
