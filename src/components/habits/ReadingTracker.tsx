import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Habit } from "@/lib/types"
import { progressPct } from "@/lib/scoring"

type ReadingTrackerProps = {
  habit: Habit
  value: number
  onChange: (value: number) => void
}

export function ReadingTracker({ habit, value, onChange }: ReadingTrackerProps) {
  const [mode, setMode] = useState<"pages" | "minutes">(
    habit.goal_unit === "min" ? "minutes" : "pages",
  )
  const target = habit.goal_target
  const pct = progressPct(habit, value)

  function add(n: number) {
    onChange(Math.min(target * 2, value + n))
  }

  return (
    <div className="border-t border-white/30 px-4 pb-4 pt-2">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "pages" | "minutes")}>
        <TabsList className="mb-3 w-full rounded-xl bg-white/40">
          <TabsTrigger value="pages" className="flex-1 rounded-lg font-bold">
            Pages
          </TabsTrigger>
          <TabsTrigger value="minutes" className="flex-1 rounded-lg font-bold">
            Minutes
          </TabsTrigger>
        </TabsList>
        <TabsContent value={mode} className="space-y-3">
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-full bg-white/50 text-xl font-bold"
              onClick={() => onChange(Math.max(0, value - 1))}
            >
              −
            </Button>
            <div className="text-center">
              <p className="text-4xl font-extrabold">{value}</p>
              <p className="text-xs font-semibold text-foreground/60">
                / {target} {mode === "pages" ? "pages" : "min"} · {pct}%
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-full bg-white/50 text-xl font-bold"
              onClick={() => add(1)}
            >
              +
            </Button>
          </div>
          <div className="flex justify-center gap-2">
            {[5, 10, 20].map((n) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
