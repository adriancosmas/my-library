import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabaseClient"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const id = typeof body?.id === "string" ? body.id : ""
  if (!UUID.test(id)) return NextResponse.json({ error: "bad id" }, { status: 400 })

  const client = getSupabaseClient()
  if (client) {
    const { error } = await client.rpc("track_click", { lib_id: id })
    if (error) console.warn("track_click failed:", error.message)
  }
  return new NextResponse(null, { status: 204 })
}
