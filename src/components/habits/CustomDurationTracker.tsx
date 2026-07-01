import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Habit } from "@/lib/types"
import { progressPct } from "@/lib/scoring"

type CustomDurationTrackerProps = {
  habit: Habit
  value: number
  onChange: (value: number) => void
}

export function CustomDurationTracker({ habit, value, onChange }: CustomDurationTrackerProps) {
  const [minutes, setMinutes] = useState(value)
  const pct = progressPct(habit, minutes)

  return (
    <div className="space-y-3 border-t border-white/30 px-4 pb-4 pt-2">
      <div className="flex justify-between text-sm font-semibold">
        <span>Duration</span>
        <span>
          {minutes} / {habit.goal_target} min · {pct}%
        </span>
      </div>
      <Slider
        value={[minutes]}
        min={0}
        max={Math.max(habit.goal_target * 2, 60)}
        step={5}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v
          if (next == null) return
          setMinutes(Number(next))
          onChange(Number(next))
        }}
      />
      <div className="flex gap-2">
        {[15, 30, 45].map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full bg-white/50"
            onClick={() => {
              setMinutes(m)
              onChange(m)
            }}
          >
            {m}m
          </Button>
        ))}
      </div>
    </div>
  )
}
