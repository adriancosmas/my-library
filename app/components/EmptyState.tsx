import type { ReactNode } from "react"

type Variant = "lost" | "search" | "shelf" | "filtered"

// Four empty states, four compositions, so a visitor can tell from the shape alone which list is empty.
// lost: a large card with a giant ghost icon (page gone). search: a dashed centred slot (query found nothing).
// shelf: copy beside a row of empty book spines (nothing saved). filtered: one compact bar (saved items hidden by filters).
const SPINES = [
  { h: "h-28", d: 80 },
  { h: "h-40", d: 140 },
  { h: "h-32", d: 200 },
  { h: "h-44", d: 260 },
  { h: "h-36", d: 320 },
]

export default function EmptyState({
  variant,
  icon,
  title,
  text,
  children,
  className = "",
}: {
  variant: Variant
  icon: ReactNode
  title: string
  text?: string
  children?: ReactNode
  className?: string
}) {
  if (variant === "lost") {
    return (
      <div className={`empty-main relative overflow-hidden rounded-md bg-card p-8 text-foreground sm:p-14 ${className}`}>
        <span className="pointer-events-none absolute -right-6 -top-6 text-muted-foreground opacity-15 [&_svg]:size-64 sm:[&_svg]:size-80" aria-hidden="true">{icon}</span>
        <div className="relative flex min-w-0 flex-col items-start gap-5 sm:max-w-xl">
          <h2 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{title}</h2>
          {text && <p className="text-lg leading-8 text-muted-foreground">{text}</p>}
          {children && <div className="pt-3">{children}</div>}
        </div>
      </div>
    )
  }

  if (variant === "search") {
    return (
      <div className={`empty-main flex min-w-0 flex-col items-center gap-4 rounded-md border-2 border-dashed border-border px-6 py-14 text-center ${className}`}>
        <span className="flex size-12 items-center justify-center rounded-sm bg-secondary text-foreground [&_svg]:size-6" aria-hidden="true">{icon}</span>
        <h2 className="max-w-prose text-balance text-2xl font-semibold tracking-tight break-words">{title}</h2>
        {text && <p className="max-w-sm text-base leading-7 text-muted-foreground">{text}</p>}
        {children && <div className="pt-2">{children}</div>}
      </div>
    )
  }

  if (variant === "shelf") {
    return (
      <div className={`grid items-end gap-10 rounded-md bg-card px-6 pt-10 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ${className}`}>
        <div className="empty-main flex min-w-0 flex-col items-start gap-4 pb-10">
          <span className="grid size-12 place-items-center rounded-sm bg-secondary text-foreground [&_svg]:size-6" aria-hidden="true">{icon}</span>
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight">{title}</h2>
          {text && <p className="max-w-md text-base leading-7 text-muted-foreground">{text}</p>}
          {children && <div className="pt-2">{children}</div>}
        </div>
        <div aria-hidden="true" className="flex items-end justify-center gap-3 border-b-2 border-border px-2">
          {SPINES.map((s, i) => (
            <span
              key={i}
              className={`empty-spine ${s.h} w-10 rounded-t-sm bg-secondary sm:w-14`}
              style={{ animationDelay: `${s.d}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`empty-main flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3 rounded-md bg-card p-4 sm:flex-nowrap ${className}`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-secondary text-foreground [&_svg]:size-5" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold leading-snug tracking-tight">{title}</h2>
        {text && <p className="text-sm leading-6 text-muted-foreground">{text}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}
