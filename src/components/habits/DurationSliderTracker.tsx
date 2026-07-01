import { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import type { Habit } from "@/lib/types"
import { progressPct } from "@/lib/scoring"
import { cn } from "@/lib/utils"

type DurationSliderTrackerProps = {
  habit: Habit
  value: number
  onChange: (value: number) => void
  label?: string
  presets?: number[]
  step?: number
  className?: string
}

export function DurationSliderTracker({
  habit,
  value,
  onChange,
  label = "Duration",
  presets = [15, 30, 45],
  step = 1,
  className,
}: DurationSliderTrackerProps) {
  const [minutes, setMinutes] = useState(value)
  const target = habit.goal_target
  const max = Math.max(target * 2, target + 30, 60)
  const pct = progressPct(habit, minutes)

  useEffect(() => {
    setMinutes(value)
  }, [value])

  function commit(next: number) {
    const clamped = Math.max(0, Math.min(max, next))
    setMinutes(clamped)
    onChange(clamped)
  }

  return (
    <div className={cn("space-y-4 border-t border-border px-4 pb-4 pt-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-display text-4xl font-black tabular-nums text-foreground">
            {minutes}
            <span className="ml-1 text-lg font-bold text-muted-foreground">min</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono-label text-[10px] text-muted-foreground">Goal</p>
          <p className="text-sm font-semibold text-foreground">
            {target} min · {pct}%
          </p>
        </div>
      </div>

      <Progress value={pct} className="h-2 bg-muted" />

      <Slider
        value={[minutes]}
        min={0}
        max={max}
        step={step}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v
          if (next == null) return
          commit(Number(next))
        }}
        className="py-2 [&_[data-slot=slider-track]]:h-2.5 [&_[data-slot=slider-thumb]]:size-5"
      />

      {presets.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {presets.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => commit(m)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono-label text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                minutes === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {m}m
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
