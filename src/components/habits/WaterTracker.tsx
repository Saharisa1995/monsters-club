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
  const target = Math.max(1, Math.round(habit.goal_target))
  const [popIdx, setPopIdx] = useState<number | null>(null)
  const pct = progressPct(habit, value)

  function addCup() {
    if (value >= target) return
    const next = value + 1
    setPopIdx(next - 1)
    onChange(next)
    setTimeout(() => setPopIdx(null), 300)
  }

  function undo() {
    if (value <= 0) return
    onChange(value - 1)
  }

  return (
    <div className="space-y-4 border-t border-white/30 px-4 pb-4 pt-2">
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: target }).map((_, i) => {
          const filled = i < value
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i + 1 === value) onChange(i)
                else if (i === value) addCup()
              }}
              className={cn(
                "cup-pop flex h-12 w-10 flex-col items-center justify-end rounded-b-2xl rounded-t-lg border-2 transition-all",
                filled
                  ? "border-sky-400 bg-sky-300/80"
                  : "border-white/50 bg-white/30",
                popIdx === i && "cup-pop",
              )}
            >
              <div
                className={cn(
                  "mb-1 w-full rounded-b-xl transition-all",
                  filled ? "h-7 bg-sky-500/70" : "h-0",
                )}
              />
            </button>
          )
        })}
      </div>
      <Progress value={pct} className="h-2 bg-white/40" />
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          {value} / {target} cups · {pct}%
        </span>
        <div className="flex gap-2">
          {value > 0 && (
            <Button type="button" size="sm" variant="outline" onClick={undo} className="rounded-full bg-white/50">
              <Undo2 className="mr-1 h-3.5 w-3.5" /> Undo
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={addCup}
            disabled={value >= target}
            className="rounded-full"
          >
            <CupSoda className="mr-1 h-3.5 w-3.5" /> +1 cup
          </Button>
        </div>
      </div>
    </div>
  )
}
