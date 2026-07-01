import { useState } from "react"
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Circle,
  Dumbbell,
  Droplets,
  NotebookPen,
  Settings2,
  ShowerHead,
  Target,
  Wind,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { HabitCard } from "./HabitCard"
import { displayHabitName } from "@/lib/habitTemplates"
import { deleteHabitLog, upsertHabitLog } from "@/lib/api"
import type { Habit, HabitLog } from "@/lib/types"
import { isLogComplete, logsForHabit, progressPct } from "@/lib/scoring"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  droplets: Droplets,
  "book-open": BookOpen,
  "notebook-pen": NotebookPen,
  brain: Brain,
  wind: Wind,
  "shower-head": ShowerHead,
  target: Target,
}

type GoalHabitCardProps = {
  habit: Habit
  index: number
  logDate: string
  logsByHabit: Record<string, Record<string, HabitLog>>
  onManage?: (habitId: string) => void
}

export function GoalHabitCard({
  habit,
  index,
  logDate,
  logsByHabit,
  onManage,
}: GoalHabitCardProps) {
  const { me, refresh } = useApp()
  const [expanded, setExpanded] = useState(false)
  const log = logsForHabit(logsByHabit, habit.id)[logDate]
  const completed = isLogComplete(habit, log)
  const value = log?.value ?? 0
  const pct = progressPct(habit, value)
  const Icon = ICON_MAP[habit.icon] ?? Target
  const name = displayHabitName(habit)
  const isBinary = habit.goal_mode === "binary"

  const progressLabel = isBinary
    ? completed
      ? "Done today"
      : "Tap to mark done"
    : `${value}/${habit.goal_target} ${habit.goal_unit}`

  async function toggleBinary() {
    if (!me) return
    try {
      if (completed) {
        await deleteHabitLog(habit.id, logDate)
      } else {
        await upsertHabitLog(habit, me.id, logDate, 1, true, {})
      }
      await refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save")
    }
  }

  function handleRowClick() {
    if (isBinary) {
      void toggleBinary()
      return
    }
    setExpanded((e) => !e)
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-all duration-200",
        completed
          ? "habit-row-checked border-[rgba(255,107,53,0.45)]"
          : "border-border bg-card",
      )}
    >
      <button
        type="button"
        onClick={handleRowClick}
        className="flex w-full items-center gap-3 p-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-expanded={!isBinary && expanded}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
          <span className="font-mono-label text-[10px] font-bold text-muted-foreground">
            {index + 1}
          </span>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            completed ? "bg-primary/20" : "bg-muted",
          )}
        >
          <Icon className={cn("h-4 w-4", completed ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{name}</div>
          <div className="font-mono-label text-[11px] text-muted-foreground">{progressLabel}</div>
          {!isBinary && (
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono-label text-[10px] text-muted-foreground">1 pt</span>
          {isBinary ? (
            completed ? (
              <CheckCircle2 className="check-pop h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )
          ) : completed ? (
            <CheckCircle2 className="check-pop h-5 w-5 text-primary" />
          ) : (
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          )}
        </div>
      </button>

      {!isBinary && expanded && (
        <>
          <HabitCard
            habit={habit}
            logDate={logDate}
            expanded
            onToggleExpand={() => setExpanded(false)}
            trackerOnly
          />
          {onManage && (
            <div className="border-t border-border px-3 pb-3 pt-1">
              <button
                type="button"
                onClick={() => onManage(habit.id)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Settings2 className="h-4 w-4" aria-hidden="true" />
                Edit goal or remove
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
