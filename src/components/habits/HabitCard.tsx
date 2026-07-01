import { HabitCardShell } from "./HabitCardShell"
import { WaterTracker } from "./WaterTracker"
import { WorkoutTracker } from "./WorkoutTracker"
import { ReadingTracker } from "./ReadingTracker"
import { JournalTracker } from "./JournalTracker"
import { DeepWorkTracker } from "./DeepWorkTracker"
import { MeditationTracker } from "./MeditationTracker"
import { CustomCountTracker } from "./CustomCountTracker"
import { CustomDurationTracker } from "./CustomDurationTracker"
import { resolveTracker } from "@/lib/habitTemplates"
import type { DeepWorkMetadata, Habit, WorkoutMetadata } from "@/lib/types"
import { logsForHabit, progressPct, streakForHabit } from "@/lib/scoring"
import { useApp } from "@/context/AppContext"
import { useHabitLogEditor } from "@/hooks/useHabitLogEditor"

type HabitCardProps = {
  habit: Habit
  logDate: string
  expanded: boolean
  onToggleExpand: () => void
  /** When true, only render tracker panel (no shell) */
  trackerOnly?: boolean
}

export function HabitCard({
  habit,
  logDate,
  expanded,
  onToggleExpand,
  trackerOnly = false,
}: HabitCardProps) {
  const { me, data } = useApp()
  const log = me && data ? logsForHabit(data.logsByHabit, habit.id)[logDate] : undefined
  const editor = useHabitLogEditor(habit, logDate, log)
  const streak = data ? streakForHabit(habit, data.logsByHabit) : 0
  const trackerKind = resolveTracker(habit)

  const { value, metadata, completed, setDraft, commit, commitDebounced, toggleBinary } = editor

  async function quickComplete() {
    if (habit.goal_mode === "binary" || trackerKind === "journal") {
      await toggleBinary(!completed)
      return
    }
    if (completed) {
      await commit(0)
      return
    }
    await commit(habit.goal_target)
  }

  const subtitle =
    habit.goal_mode === "binary"
      ? completed
        ? "Done"
        : "Not done yet"
      : `${value} / ${habit.goal_target} ${habit.goal_unit} · ${progressPct(habit, value)}%`

  const sliderProps = {
    onDraftChange: (v: number) => setDraft(v),
    onCommit: (v: number) => {
      void commit(v)
    },
  }

  const trackerPanel = expanded ? (
    <>
      {trackerKind === "water" && (
        <WaterTracker
          habit={habit}
          value={value}
          onChange={(v) => commitDebounced(v)}
        />
      )}
      {trackerKind === "workout" && (
        <WorkoutTracker
          habit={habit}
          value={value}
          metadata={metadata as WorkoutMetadata}
          {...sliderProps}
        />
      )}
      {trackerKind === "reading" && (
        <ReadingTracker
          habit={habit}
          value={value}
          onDraftChange={(v) => setDraft(v)}
          onCommit={(v) => void commit(v)}
        />
      )}
      {trackerKind === "journal" && (
        <JournalTracker
          habit={habit}
          completed={completed}
          onChange={(done) => void toggleBinary(done)}
        />
      )}
      {trackerKind === "deep_work" && (
        <DeepWorkTracker
          habit={habit}
          value={value}
          metadata={metadata as DeepWorkMetadata}
          {...sliderProps}
        />
      )}
      {trackerKind === "meditation" && (
        <MeditationTracker habit={habit} value={value} {...sliderProps} />
      )}
      {trackerKind === "custom_count" && (
        <CustomCountTracker
          habit={habit}
          value={value}
          onChange={(v) => commitDebounced(v)}
        />
      )}
      {trackerKind === "custom_duration" && (
        <CustomDurationTracker habit={habit} value={value} {...sliderProps} />
      )}
    </>
  ) : null

  if (trackerOnly) {
    return trackerPanel
  }

  return (
    <HabitCardShell
      habit={habit}
      completed={completed}
      subtitle={subtitle}
      streak={streak}
      onOpen={onToggleExpand}
      onToggleComplete={quickComplete}
    >
      {trackerPanel}
    </HabitCardShell>
  )
}
