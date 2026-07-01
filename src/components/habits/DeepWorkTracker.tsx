import { DurationSliderTracker } from "./DurationSliderTracker"
import type { DeepWorkMetadata, Habit } from "@/lib/types"

type DeepWorkTrackerProps = {
  habit: Habit
  value: number
  metadata: DeepWorkMetadata
  onChange: (value: number, metadata: DeepWorkMetadata) => void
}

export function DeepWorkTracker({ habit, value, metadata, onChange }: DeepWorkTrackerProps) {
  return (
    <DurationSliderTracker
      habit={habit}
      value={value}
      onChange={(v) => onChange(v, metadata)}
      label="Deep work"
      presets={[30, 60, 90]}
      step={5}
    />
  )
}
