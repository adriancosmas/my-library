import type { ReactNode } from "react"

export default function EmptyState({
  icon,
  title,
  text,
  children,
  className = "",
}: {
  icon: ReactNode
  title: string
  text?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center gap-3 rounded-md bg-card px-6 py-16 text-center ${className}`}>
      <span className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {text && <p className="max-w-sm text-sm text-muted-foreground">{text}</p>}
      {children}
    </div>
  )
}
