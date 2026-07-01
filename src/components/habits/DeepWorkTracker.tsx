import { DurationSliderTracker } from "./DurationSliderTracker"
import type { DeepWorkMetadata, Habit } from "@/lib/types"

type DeepWorkTrackerProps = {
  habit: Habit
  value: number
  metadata: DeepWorkMetadata
  onDraftChange: (value: number) => void
  onCommit: (value: number) => void
}

export function DeepWorkTracker({
  habit,
  value,
  onDraftChange,
  onCommit,
}: DeepWorkTrackerProps) {
  return (
    <DurationSliderTracker
      habit={habit}
      value={value}
      onDraftChange={onDraftChange}
      onCommit={onCommit}
      label="Deep work"
      presets={[30, 60, 90]}
      step={5}
    />
  )
}
