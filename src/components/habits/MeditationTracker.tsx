import { DurationSliderTracker } from "./DurationSliderTracker"
import type { Habit } from "@/lib/types"

type MeditationTrackerProps = {
  habit: Habit
  value: number
  onChange: (value: number) => void
}

export function MeditationTracker({ habit, value, onChange }: MeditationTrackerProps) {
  return (
    <DurationSliderTracker
      habit={habit}
      value={value}
      onChange={onChange}
      label="Meditation"
      presets={[5, 10, 15]}
      step={1}
    />
  )
}
