import { ImageResponse } from "next/og"
import { getLibraryBySlug } from "@/lib/libraries"
import { SITE_NAME } from "@/lib/site"

export const alt = "Tool preview"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const revalidate = 3600

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const lib = await getLibraryBySlug(slug)
  const name = lib?.name ?? "Tool"
  const description = (lib?.description ?? "").slice(0, 140)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#09090b",
          color: "#fff",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa" }}>{SITE_NAME}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, lineHeight: 1.05 }}>{name}</div>
          <div style={{ display: "flex", fontSize: 36, color: "#a1a1aa", lineHeight: 1.3 }}>{description}</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(lib?.tags ?? []).slice(0, 4).map((t) => (
            <div key={t} style={{ display: "flex", fontSize: 26, background: "#27272a", padding: "8px 20px", borderRadius: 999 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
