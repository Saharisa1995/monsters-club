import {
  BookOpen,
  Camera,
  CheckCircle2,
  Circle,
  Droplets,
  Dumbbell,
  Lock,
  Salad,
  ShowerHead,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react"
import type { Habit } from "@/lib/types"
import { HABIT_DETAILS } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  sun: Sun,
  droplets: Droplets,
  droplet: Droplets,
  salad: Salad,
  "book-open": BookOpen,
  camera: Camera,
  "shower-head": ShowerHead,
  target: Target,
}

type HabitRowProps = {
  habit: Habit
  index: number
  checked: boolean
  detail?: string
  photoLocked?: boolean
  onToggle: () => void
}

export function HabitRow({
  habit,
  index,
  checked,
  detail,
  photoLocked,
  onToggle,
}: HabitRowProps) {
  const Icon = ICON_MAP[habit.icon] ?? Target
  const subtitle =
    detail ?? HABIT_DETAILS[habit.habit_type] ?? "1 point when complete"

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        checked
          ? "habit-row-checked border-[rgba(255,107,53,0.45)]"
          : "border-border bg-card hover:border-[rgba(99,102,241,0.35)]",
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
        <span className="font-mono-label text-[10px] font-bold text-muted-foreground">
          {index + 1}
        </span>
      </div>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          checked ? "bg-primary/20" : "bg-muted",
        )}
      >
        <Icon className={cn("h-4 w-4", checked ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          {habit.name}
          {photoLocked && (
            <Lock className="h-3 w-3 text-muted-foreground" aria-label="Photo upload coming soon" />
          )}
        </div>
        <div className="font-mono-label text-[11px] text-muted-foreground">{subtitle}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono-label text-[10px] text-muted-foreground">1 pt</span>
        {checked ? (
          <CheckCircle2 className="check-pop h-5 w-5 shrink-0 text-primary" />
        ) : (
          <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </div>
    </button>
  )
}
