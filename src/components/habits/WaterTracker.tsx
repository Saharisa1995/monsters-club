import { useState } from "react"
import { CupSoda, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Habit } from "@/lib/types"
import { progressPct } from "@/lib/scoring"
import { cn } from "@/lib/utils"

type WaterTrackerProps = {
  habit: Habit
  value: number
  onChange: (value: number) => void
}

export function WaterTracker({ habit, value, onChange }: WaterTrackerProps) {
  const isMl = habit.goal_unit === "ml"
  const target = Math.max(1, Math.round(habit.goal_target))
  const step = isMl ? 250 : 1
  const unitLabel = isMl ? "ml" : "cups"
  const [popIdx, setPopIdx] = useState<number | null>(null)
  const pct = progressPct(habit, value)

  function add(amount = step) {
    if (value >= target) return
    const next = Math.min(target, value + amount)
    if (!isMl) {
      setPopIdx(next - 1)
      setTimeout(() => setPopIdx(null), 300)
    }
    onChange(next)
  }

  function undo() {
    if (value <= 0) return
    onChange(Math.max(0, value - step))
  }

  if (isMl) {
    return (
      <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
        <Progress value={pct} className="h-2 bg-muted" />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>
            {value} / {target} {unitLabel} · {pct}%
          </span>
          <div className="flex gap-2">
            {value > 0 && (
              <Button type="button" size="sm" variant="outline" onClick={undo} className="rounded-full">
                <Undo2 className="mr-1 h-3.5 w-3.5" /> Undo
              </Button>
            )}
            <Button type="button" size="sm" onClick={() => add()} disabled={value >= target} className="rounded-full">
              +{step} ml
            </Button>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          {[250, 500, 750].map((n) => (
            <Button key={n} type="button" size="sm" variant="secondary" className="rounded-full" onClick={() => add(n)}>
              +{n}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: target }).map((_, i) => {
          const filled = i < value
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i + 1 === value) onChange(i)
                else if (i === value) add()
              }}
              className={cn(
                "cup-pop flex h-12 w-10 flex-col items-center justify-end rounded-b-2xl rounded-t-lg border-2 transition-all",
                filled ? "border-primary/60 bg-primary/20" : "border-border bg-muted/50",
                popIdx === i && "cup-pop",
              )}
              aria-label={`Cup ${i + 1}`}
            >
              <div
                className={cn(
                  "mb-1 w-full rounded-b-xl transition-all",
                  filled ? "h-7 bg-primary/60" : "h-0",
                )}
              />
            </button>
          )
        })}
      </div>
      <Progress value={pct} className="h-2 bg-muted" />
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {value} / {target} {unitLabel} · {pct}%
        </span>
        <div className="flex gap-2">
          {value > 0 && (
            <Button type="button" size="sm" variant="outline" onClick={undo} className="rounded-full">
              <Undo2 className="mr-1 h-3.5 w-3.5" /> Undo
            </Button>
          )}
          <Button type="button" size="sm" onClick={() => add()} disabled={value >= target} className="rounded-full">
            <CupSoda className="mr-1 h-3.5 w-3.5" /> +1 cup
          </Button>
        </div>
      </div>
    </div>
  )
}
