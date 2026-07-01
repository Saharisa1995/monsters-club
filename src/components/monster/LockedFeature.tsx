import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

type LockedFeatureProps = {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode
}

export function LockedFeature({
  title,
  description = "Coming soon",
  className,
  children,
}: LockedFeatureProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border", className)}>
      {children && (
        <div className="pointer-events-none select-none blur-sm opacity-40" aria-hidden="true">
          {children}
        </div>
      )}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-8 text-center",
          children ? "absolute inset-0 bg-background/80 backdrop-blur-sm" : "bg-card py-16",
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-xl font-black uppercase tracking-wide text-foreground">
            {title}
          </p>
          <p className="mt-1 font-mono-label text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full border border-border bg-muted px-3 py-1 font-mono-label text-[10px] uppercase tracking-widest text-muted-foreground">
          Coming soon
        </span>
      </div>
    </div>
  )
}
