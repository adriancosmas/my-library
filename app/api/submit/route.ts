import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 })

  // Honeypot: real users never fill this field. Pretend success so bots move on.
  if (str(body.website, 100)) return new NextResponse(null, { status: 204 })

  const name = str(body.name, 100)
  const description = str(body.description, 500)
  const category = str(body.category, 50)
  let url = str(body.url, 300)
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`

  let valid = false
  try {
    const u = new URL(url)
    valid = (u.protocol === "http:" || u.protocol === "https:") && u.hostname.includes(".")
  } catch {}

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 })
  if (!valid) return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 })

  const client = getSupabaseClient()
  if (!client) return NextResponse.json({ error: "Submissions are unavailable." }, { status: 503 })

  const { error } = await client.rpc("submit_tool", {
    p_name: name,
    p_url: url,
    p_description: description,
    p_category: category,
  })
  if (error) {
    console.warn("submit_tool failed:", error.message)
    return NextResponse.json({ error: "Could not save your submission. Try again later." }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
