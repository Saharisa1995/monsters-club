import { DurationSliderTracker } from "./DurationSliderTracker"
import type { Habit, WorkoutMetadata } from "@/lib/types"

type WorkoutTrackerProps = {
  habit: Habit
  value: number
  metadata: WorkoutMetadata
  onChange: (value: number, metadata: WorkoutMetadata) => void
}

export function WorkoutTracker({ habit, value, metadata, onChange }: WorkoutTrackerProps) {
  return (
    <DurationSliderTracker
      habit={habit}
      value={value}
      onChange={(v) => onChange(v, metadata)}
      label="Workout"
      presets={[20, 30, 45, 60]}
      step={5}
    />
  )
}
