import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"
import type { Habit } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

type HabitCardShellProps = {
  habit: Habit
  completed: boolean
  subtitle?: string
  streak?: number
  onOpen: () => void
  onToggleComplete: () => void
  children?: ReactNode
}

function habitIcon(name: string): LucideIcon {
  const key = name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("") as keyof typeof Icons
  return (Icons[key] as LucideIcon) ?? Icons.Target
}

export function HabitCardShell({
  habit,
  completed,
  subtitle,
  streak,
  onOpen,
  onToggleComplete,
  children,
}: HabitCardShellProps) {
  const Icon = habitIcon(habit.icon)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
              Daily
            </p>
            <p
              className={cn(
                "truncate font-display text-lg font-black text-foreground",
                completed && "text-primary",
              )}
            >
              {habit.name}
            </p>
            {subtitle && (
              <p className="font-mono-label text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </button>
        {streak != null && streak > 0 && (
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 font-mono-label text-[10px] font-bold text-primary">
            {streak}d
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete()
          }}
          className={cn(
            "check-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            completed
              ? "border-primary bg-primary text-white"
              : "border-border bg-muted text-transparent",
          )}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
        >
          <Check className="h-5 w-5" strokeWidth={3} />
        </button>
      </div>
      {children}
    </div>
  )
}
