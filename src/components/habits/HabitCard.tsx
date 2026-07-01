import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { HabitCardShell } from "./HabitCardShell"
import { WaterTracker } from "./WaterTracker"
import { WorkoutTracker } from "./WorkoutTracker"
import { ReadingTracker } from "./ReadingTracker"
import { JournalTracker } from "./JournalTracker"
import { DeepWorkTracker } from "./DeepWorkTracker"
import { MeditationTracker } from "./MeditationTracker"
import { CustomCountTracker } from "./CustomCountTracker"
import { CustomDurationTracker } from "./CustomDurationTracker"
import {
  deleteHabitLog,
  upsertHabitLog,
} from "@/lib/api"
import { resolveTracker } from "@/lib/habitTemplates"
import type { DeepWorkMetadata, Habit, WorkoutMetadata } from "@/lib/types"
import {
  isLogComplete,
  logsForHabit,
  progressPct,
  streakForHabit,
} from "@/lib/scoring"
import { useApp } from "@/context/AppContext"

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
  const { me, data, refresh } = useApp()
  const log = me && data ? logsForHabit(data.logsByHabit, habit.id)[logDate] : undefined
  const [value, setValue] = useState(log?.value ?? 0)
  const [metadata, setMetadata] = useState<Record<string, unknown>>(log?.metadata ?? {})

  const completed = isLogComplete(habit, log)
  const streak = data ? streakForHabit(habit, data.logsByHabit) : 0
  const trackerKind = resolveTracker(habit)

  useEffect(() => {
    setValue(log?.value ?? 0)
    setMetadata(log?.metadata ?? {})
  }, [log])

  const toggleBinary = useCallback(
    async (done: boolean) => {
      if (!me) return
      try {
        if (!done) {
          await deleteHabitLog(habit.id, logDate)
        } else {
          await upsertHabitLog(habit, me.id, logDate, 1, true, {})
        }
        await refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save")
      }
    },
    [habit, logDate, me, refresh],
  )

  const save = useCallback(
    async (nextValue: number, nextMeta: Record<string, unknown> = metadata) => {
      if (!me) return
      const done =
        habit.goal_mode === "binary"
          ? nextValue >= 1
          : nextValue >= habit.goal_target
      try {
        if (nextValue <= 0) {
          await deleteHabitLog(habit.id, logDate)
        } else {
          await upsertHabitLog(habit, me.id, logDate, nextValue, done, nextMeta)
        }
        await refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save")
      }
    },
    [habit, logDate, me, metadata, refresh],
  )

  async function quickComplete() {
    if (habit.goal_mode === "binary" || trackerKind === "journal") {
      await toggleBinary(!completed)
      return
    }
    if (completed) {
      try {
        await deleteHabitLog(habit.id, logDate)
        await refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't update")
      }
      return
    }
    await save(habit.goal_target, metadata)
  }

  const subtitle =
    habit.goal_mode === "binary"
      ? completed
        ? "Done"
        : "Not done yet"
      : `${value} / ${habit.goal_target} ${habit.goal_unit} · ${progressPct(habit, value)}%`

  const trackerPanel = expanded ? (
    <>
      {trackerKind === "water" && (
        <WaterTracker
          habit={habit}
          value={value}
          onChange={(v) => {
            setValue(v)
            save(v)
          }}
        />
      )}
      {trackerKind === "workout" && (
        <WorkoutTracker
          habit={habit}
          value={value}
          metadata={metadata as WorkoutMetadata}
          onChange={(v, m) => {
            setValue(v)
            setMetadata(m)
            save(v, m)
          }}
        />
      )}
      {trackerKind === "reading" && (
        <ReadingTracker
          habit={habit}
          value={value}
          onChange={(v) => {
            setValue(v)
            save(v)
          }}
        />
      )}
      {trackerKind === "journal" && (
        <JournalTracker
          habit={habit}
          completed={completed}
          onChange={toggleBinary}
        />
      )}
      {trackerKind === "deep_work" && (
        <DeepWorkTracker
          habit={habit}
          value={value}
          metadata={metadata as DeepWorkMetadata}
          onChange={(v, m) => {
            setValue(v)
            setMetadata(m)
            save(v, m)
          }}
        />
      )}
      {trackerKind === "meditation" && (
        <MeditationTracker
          habit={habit}
          value={value}
          onChange={(v) => {
            setValue(v)
            save(v)
          }}
        />
      )}
      {trackerKind === "custom_count" && (

        <CustomCountTracker
          habit={habit}
          value={value}
          onChange={(v) => {
            setValue(v)
            save(v)
          }}
        />
      )}
      {trackerKind === "custom_duration" && (
        <CustomDurationTracker
          habit={habit}
          value={value}
          onChange={(v) => {
            setValue(v)
            save(v)
          }}
        />
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
