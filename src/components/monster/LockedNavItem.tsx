import { Lock } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type LockedNavItemProps = {
  icon: LucideIcon
  label: string
  active?: boolean
  onClick: () => void
}

export function LockedNavItem({ icon: Icon, label, active, onClick }: LockedNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} (coming soon)`}
      aria-disabled="true"
      className={cn(
        "relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className={cn("h-5 w-5", active && "scale-110")} />
      <span className="font-mono-label text-[10px] font-medium">{label}</span>
      <Lock
        className="absolute -top-0.5 -right-0.5 h-3 w-3 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  )
}
