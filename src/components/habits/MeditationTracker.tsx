import { DurationSliderTracker } from "./DurationSliderTracker"
import type { Habit } from "@/lib/types"

type MeditationTrackerProps = {
  habit: Habit
  value: number
  onDraftChange: (value: number) => void
  onCommit: (value: number) => void
}

export function MeditationTracker({ habit, value, onDraftChange, onCommit }: MeditationTrackerProps) {
  return (
    <DurationSliderTracker
      habit={habit}
      value={value}
      onDraftChange={onDraftChange}
      onCommit={onCommit}
      label="Meditation"
      presets={[5, 10, 15]}
      step={1}
    />
  )
}
