import { DurationSliderTracker } from "./DurationSliderTracker"
import type { Habit } from "@/lib/types"

type CustomDurationTrackerProps = {
  habit: Habit
  value: number
  onDraftChange: (value: number) => void
  onCommit: (value: number) => void
}

export function CustomDurationTracker({
  habit,
  value,
  onDraftChange,
  onCommit,
}: CustomDurationTrackerProps) {
  return (
    <DurationSliderTracker
      habit={habit}
      value={value}
      onDraftChange={onDraftChange}
      onCommit={onCommit}
      label="Duration"
      presets={[15, 30, 45, 60]}
      step={5}
    />
  )
}
