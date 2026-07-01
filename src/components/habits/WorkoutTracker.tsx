import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Habit, WorkoutMetadata } from "@/lib/types"
import { progressPct } from "@/lib/scoring"

type WorkoutTrackerProps = {
  habit: Habit
  value: number
  metadata: WorkoutMetadata
  onChange: (value: number, metadata: WorkoutMetadata) => void
}

const ACTIVITIES = ["Cardio", "Strength", "Yoga", "Other"]
const PRESETS = [20, 30, 45, 60]

export function WorkoutTracker({ habit, value, metadata, onChange }: WorkoutTrackerProps) {
  const [minutes, setMinutes] = useState(value || 0)
  const [activity, setActivity] = useState(metadata.activity ?? "Cardio")
  const [note, setNote] = useState(metadata.note ?? "")
  const pct = progressPct(habit, minutes)

  function apply(nextMin: number, nextAct = activity, nextNote = note) {
    setMinutes(nextMin)
    onChange(nextMin, { activity: nextAct, note: nextNote })
  }

  return (
    <div className="space-y-4 border-t border-white/30 px-4 pb-4 pt-2">
      <div>
        <Label className="text-xs font-bold uppercase text-foreground/50">Activity</Label>
        <ToggleGroup
          value={[activity]}
          onValueChange={(v) => {
            const a = v[0] ?? activity
            setActivity(a)
            apply(minutes, a, note)
          }}
          className="mt-2 flex flex-wrap justify-start gap-2"
        >
          {ACTIVITIES.map((a) => (
            <ToggleGroupItem key={a} value={a} className="rounded-full bg-white/40 px-3 text-xs font-bold">
              {a}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div>
        <div className="mb-2 flex justify-between text-sm font-semibold">
          <span>Duration</span>
          <span>
            {minutes} / {habit.goal_target} min · {pct}%
          </span>
        </div>
        <Slider
          value={[minutes]}
          min={0}
          max={120}
          step={5}
          onValueChange={(v) => {
            const next = Array.isArray(v) ? v[0] : v
            apply(Number(next ?? 0))
          }}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={minutes === p ? "default" : "outline"}
              className="rounded-full bg-white/50"
              onClick={() => apply(p)}
            >
              {p}m
            </Button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-bold uppercase text-foreground/50">Note (optional)</Label>
        <Input
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            apply(minutes, activity, e.target.value)
          }}
          placeholder="How did it feel?"
          className="mt-1 rounded-xl bg-white/50"
        />
      </div>
    </div>
  )
}
