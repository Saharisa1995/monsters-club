import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type PageContentProps = {
  children: ReactNode
  className?: string
}

/** Standard tab page stack — shared vertical rhythm across Today, Club, Feed, etc. */
export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-5", className)}>
      {children}
    </div>
  )
}

type PageHeaderProps = {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header>
      <h1 className="font-display text-5xl font-black uppercase">{title}</h1>
      {description ? (
        <p className="mt-1 font-mono-label text-xs text-muted-foreground">{description}</p>
      ) : null}
    </header>
  )
}
