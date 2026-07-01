import type { RankTier } from "@/lib/ranks"
import { cn } from "@/lib/utils"

type RankBadgeProps = RankTier & {
  className?: string
}

export function RankBadge({ label, color, bg, glow = "", className }: RankBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2.5 py-0.5 font-display text-xs font-black tracking-widest uppercase transition-shadow",
        color,
        bg,
        glow,
        className,
      )}
    >
      {label}
    </span>
  )
}
