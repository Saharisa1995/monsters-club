import { DurationSliderTracker } from "./DurationSliderTracker"
import { Button } from "@/components/ui/button"
import type { Habit } from "@/lib/types"
import { progressPct } from "@/lib/scoring"

type ReadingTrackerProps = {
  habit: Habit
  value: number
  onChange: (value: number) => void
}

export function ReadingTracker({ habit, value, onChange }: ReadingTrackerProps) {
  const isMinutes = habit.goal_unit === "min"

  if (isMinutes) {
    return (
      <DurationSliderTracker
        habit={habit}
        value={value}
        onChange={onChange}
        label="Reading time"
        presets={[10, 20, 30]}
        step={1}
      />
    )
  }

  const target = habit.goal_target
  const pct = progressPct(habit, value)
  const presets = [5, 10, 20]

  function add(n: number) {
    onChange(Math.min(target * 2, value + n))
  }

  return (
    <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
      <p className="font-mono-label text-[10px] text-muted-foreground">
        Tracking by pages — edit goal in Habits library
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 rounded-full border-border bg-secondary/50 text-xl font-bold"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="Decrease"
        >
          −
        </Button>
        <div className="text-center">
          <p className="font-display text-4xl font-black text-foreground">{value}</p>
          <p className="font-mono-label text-xs text-muted-foreground">
            / {target} pages · {pct}%
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-12 rounded-full border-border bg-secondary/50 text-xl font-bold"
          onClick={() => add(1)}
          aria-label="Increase"
        >
          +
        </Button>
      </div>
      <div className="flex justify-center gap-2">
        {presets.map((n) => (
          <Button
            key={n}
            type="button"
            size="sm"
            variant="secondary"
            className="rounded-full font-bold"
            onClick={() => add(n)}
          >
            +{n}
          </Button>
        ))}
      </div>
    </div>
  )
}
