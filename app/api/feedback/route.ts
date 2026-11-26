import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 })

  // Honeypot: real users never fill this field. Pretend success so bots move on.
  if (str(body.website, 100)) return new NextResponse(null, { status: 204 })

  const message = str(body.message, 2000)
  const email = str(body.email, 200)
  const path = str(body.path, 200)

  if (message.length < 3) return NextResponse.json({ error: "Write a short message first." }, { status: 400 })
  if (email && !EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email or leave it empty." }, { status: 400 })

  const client = getSupabaseClient()
  if (!client) return NextResponse.json({ error: "Feedback is unavailable." }, { status: 503 })

  const { error } = await client.rpc("submit_feedback", {
    p_message: message,
    p_email: email,
    p_path: path.startsWith("/") ? path : "",
  })
  if (error) {
    console.warn("submit_feedback failed:", error.message)
    return NextResponse.json({ error: "Could not send your feedback. Try again later." }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
