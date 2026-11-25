"use client"

import type { ReactNode } from "react"
import { trackClick } from "@/lib/trackClick"

export default function VisitLink({
  id,
  href,
  className,
  children,
  ...rest
}: {
  id: string
  href: string
  className?: string
  children: ReactNode
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "id">) {
  return (
    <a
      {...rest}
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => trackClick(id)}
      onAuxClick={() => trackClick(id)}
    >
      {children}
    </a>
  )
}
