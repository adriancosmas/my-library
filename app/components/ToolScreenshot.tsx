"use client"

import Image from "next/image"
import { useState } from "react"
import { ImageOff } from "lucide-react"

export default function ToolScreenshot({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative mt-8 aspect-video w-full max-w-3xl overflow-hidden rounded-md bg-card">
      {src && !failed ? (
        <Image
          src={src}
          alt={`${name} website screenshot`}
          fill
          sizes="(min-width: 1024px) 768px, 100vw"
          className="object-cover"
          unoptimized
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="size-8" aria-hidden />
          <span className="text-sm">No preview available</span>
        </div>
      )}
    </div>
  )
}
