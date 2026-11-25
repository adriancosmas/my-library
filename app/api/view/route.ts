import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

const BOT = /bot|crawl|spider|slurp|headless|preview|lighthouse|curl|wget|python|node-fetch/i

function device(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet"
  if (/mobi|android|iphone/i.test(ua)) return "mobile"
  return "desktop"
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? ""
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 })

  const body = await req.json().catch(() => null)
  const path = typeof body?.path === "string" ? body.path : ""
  if (!path.startsWith("/") || path.length > 200 || path.startsWith("/api")) {
    return NextResponse.json({ error: "bad path" }, { status: 400 })
  }

  let referrer = ""
  if (typeof body?.referrer === "string" && body.referrer) {
    try {
      const host = new URL(body.referrer).hostname
      if (host !== new URL(req.url).hostname) referrer = host
    } catch {}
  }

  // Salted per-day hash: counts unique visitors per day, cannot be reversed or linked across days.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? ""
  const day = new Date().toISOString().slice(0, 10)
  const visitor = createHash("sha256")
    .update(`${process.env.VISITOR_SALT ?? "best-tools"}|${day}|${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32)

  const client = getSupabaseClient()
  if (client) {
    const { error } = await client.rpc("track_view", {
      p_path: path,
      p_visitor: visitor,
      p_referrer: referrer,
      p_country: req.headers.get("x-vercel-ip-country") ?? "",
      p_device: device(ua),
    })
    if (error) console.warn("track_view failed:", error.message)
  }
  return new NextResponse(null, { status: 204 })
}
