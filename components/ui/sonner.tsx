"use client"

import { Check, Info, TriangleAlert, X } from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const badge = "grid size-6 shrink-0 place-items-center rounded-full"

// Popover surface tinted by type, every type at the same 12% opacity,.
// Tints mix into the opaque popover colour, so text stays readable in light and dark.
const base =
  "gap-3! rounded-md! border-0! px-4! py-3.5! text-[15px]! font-medium! text-popover-foreground! shadow-none!"

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      gap={10}
      duration={3500}
      icons={{
        success: <span className={`${badge} bg-primary text-primary-foreground`}><Check className="size-4" strokeWidth={3} /></span>,
        info: <span className={`${badge} bg-sky-500 text-white`}><Info className="size-4" /></span>,
        warning: <span className={`${badge} bg-amber-500 text-black`}><TriangleAlert className="size-4" /></span>,
        error: <span className={`${badge} bg-destructive text-white`}><X className="size-4" strokeWidth={3} /></span>,
      }}
      toastOptions={{
        classNames: {
          toast: base,
          success: "bg-[color-mix(in_oklab,var(--popover)_88%,var(--primary))]!",
          info: "bg-[color-mix(in_oklab,var(--popover)_88%,var(--color-sky-500))]!",
          warning: "bg-[color-mix(in_oklab,var(--popover)_88%,var(--color-amber-500))]!",
          error: "bg-[color-mix(in_oklab,var(--popover)_88%,var(--destructive))]!",
        },
      }}
      {...props}
    />
  )
}
