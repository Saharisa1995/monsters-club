import { DurationSliderTracker } from "./DurationSliderTracker"
import type { Habit, WorkoutMetadata } from "@/lib/types"

type WorkoutTrackerProps = {
  habit: Habit
  value: number
  metadata: WorkoutMetadata
  onDraftChange: (value: number) => void
  onCommit: (value: number) => void
}

export function WorkoutTracker({
  habit,
  value,
  onDraftChange,
  onCommit,
}: WorkoutTrackerProps) {
  return (
    <DurationSliderTracker
      habit={habit}
      value={value}
      onDraftChange={onDraftChange}
      onCommit={onCommit}
      label="Workout"
      presets={[20, 30, 45, 60]}
      step={5}
    />
  )
}
