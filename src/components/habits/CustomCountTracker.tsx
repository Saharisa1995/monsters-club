import { Button } from "@/components/ui/button"
import type { Habit } from "@/lib/types"
import { progressPct } from "@/lib/scoring"

type CustomCountTrackerProps = {
  habit: Habit
  value: number
  onChange: (value: number) => void
}

export function CustomCountTracker({ habit, value, onChange }: CustomCountTrackerProps) {
  const pct = progressPct(habit, value)
  const unit = habit.goal_unit || "times"

  return (
    <div className="flex items-center justify-between border-t border-white/30 px-4 py-4">
      <div>
        <p className="text-3xl font-extrabold">{value}</p>
        <p className="text-xs font-semibold text-foreground/60">
          / {habit.goal_target} {unit} · {pct}%
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 rounded-full bg-white/50 text-lg"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </Button>
        <Button
          type="button"
          className="h-11 w-11 rounded-full text-lg"
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  )
}
