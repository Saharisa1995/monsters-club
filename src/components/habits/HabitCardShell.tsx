import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"
import type { Habit, HabitType } from "@/lib/types"
import { HABIT_TYPE_COLORS } from "@/lib/types"
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
  const bg = HABIT_TYPE_COLORS[habit.habit_type as HabitType] ?? HABIT_TYPE_COLORS.custom

  return (
    <div className={cn("overflow-hidden rounded-3xl shadow-sm", bg)}>
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
            <Icon className="h-5 w-5 text-foreground/80" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Anytime</p>
            <p
              className={cn(
                "truncate text-[17px] font-bold text-foreground",
                completed && "line-through opacity-70",
              )}
            >
              {habit.name}
            </p>
            {subtitle && <p className="text-xs font-medium text-foreground/60">{subtitle}</p>}
          </div>
        </button>
        {streak != null && streak > 0 && (
          <span className="shrink-0 rounded-full bg-black/10 px-2 py-0.5 text-[11px] font-bold">
            🔥 {streak}d
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete()
          }}
          className={cn(
            "check-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            completed
              ? "border-success bg-success text-white"
              : "border-white/60 bg-white/20 text-transparent",
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
