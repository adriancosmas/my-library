import { ImageResponse } from "next/og"
import { SITE_BRAND, SITE_DESCRIPTION } from "@/lib/site"

export const alt = SITE_BRAND
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
          background: "#09090b",
          color: "#fff",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 104, fontWeight: 700, lineHeight: 1.05 }}>{SITE_BRAND}</div>
        <div style={{ display: "flex", fontSize: 38, color: "#a1a1aa", lineHeight: 1.35 }}>{SITE_DESCRIPTION}</div>
        <div style={{ display: "flex", width: 160, height: 10, borderRadius: 999, background: "#facc15" }} />
      </div>
    ),
    size
  )
}
