import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { HabitCardShell } from "./HabitCardShell"
import { WaterTracker } from "./WaterTracker"
import { WorkoutTracker } from "./WorkoutTracker"
import { ReadingTracker } from "./ReadingTracker"
import { JournalTracker } from "./JournalTracker"
import { DeepWorkTracker } from "./DeepWorkTracker"
import { CustomCountTracker } from "./CustomCountTracker"
import { CustomDurationTracker } from "./CustomDurationTracker"
import {
  deleteHabitLog,
  fetchJournalEntry,
  upsertHabitLog,
  upsertJournalEntry,
} from "@/lib/api"
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
}

export function HabitCard({ habit, logDate, expanded, onToggleExpand }: HabitCardProps) {
  const { me, data, refresh } = useApp()
  const log = me && data ? logsForHabit(data.logsByHabit, habit.id)[logDate] : undefined
  const [value, setValue] = useState(log?.value ?? 0)
  const [metadata, setMetadata] = useState<Record<string, unknown>>(log?.metadata ?? {})
  const [journalContent, setJournalContent] = useState("")
  const [journalMood, setJournalMood] = useState<number | null>(null)

  const completed = isLogComplete(habit, log)
  const streak = data ? streakForHabit(habit, data.logsByHabit) : 0

  useEffect(() => {
    setValue(log?.value ?? 0)
    setMetadata(log?.metadata ?? {})
  }, [log])

  useEffect(() => {
    if (habit.habit_type !== "journal" || !me) return
    fetchJournalEntry(habit.id, logDate).then((entry) => {
      setJournalContent(entry?.content ?? "")
      setJournalMood(entry?.mood ?? null)
    })
  }, [habit.habit_type, habit.id, logDate, me])

  const save = useCallback(
    async (nextValue: number, nextMeta: Record<string, unknown> = metadata) => {
      if (!me) return
      const done =
        habit.goal_mode === "binary"
          ? nextValue >= 1
          : nextValue >= habit.goal_target
      try {
        if (nextValue <= 0 && habit.habit_type !== "journal") {
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

  const saveJournal = useCallback(
    async (content: string, mood: number | null) => {
      if (!me) return
      setJournalContent(content)
      setJournalMood(mood)
      try {
        await upsertJournalEntry(habit.id, me.id, logDate, content, mood)
        const done = content.trim().length > 0
        await upsertHabitLog(habit, me.id, logDate, done ? 1 : 0, done, {})
        await refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save journal")
      }
    },
    [habit, logDate, me, refresh],
  )

  async function quickComplete() {
    if (completed && habit.habit_type !== "journal") {
      try {
        await deleteHabitLog(habit.id, logDate)
        await refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't update")
      }
      return
    }
    if (habit.habit_type === "journal") {
      onToggleExpand()
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

  return (
    <HabitCardShell
      habit={habit}
      completed={completed}
      subtitle={subtitle}
      streak={streak}
      onOpen={onToggleExpand}
      onToggleComplete={quickComplete}
    >
      {expanded && (
        <>
          {habit.habit_type === "water" && (
            <WaterTracker
              habit={habit}
              value={value}
              onChange={(v) => {
                setValue(v)
                save(v)
              }}
            />
          )}
          {habit.habit_type === "workout" && (
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
          {habit.habit_type === "reading" && (
            <ReadingTracker
              habit={habit}
              value={value}
              onChange={(v) => {
                setValue(v)
                save(v)
              }}
            />
          )}
          {habit.habit_type === "journal" && (
            <JournalTracker
              habit={habit}
              content={journalContent}
              mood={journalMood}
              onChange={saveJournal}
            />
          )}
          {habit.habit_type === "deep_work" && (
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
          {habit.habit_type === "custom" && habit.goal_mode === "count" && (
            <CustomCountTracker
              habit={habit}
              value={value}
              onChange={(v) => {
                setValue(v)
                save(v)
              }}
            />
          )}
          {habit.habit_type === "custom" &&
            (habit.goal_mode === "duration" || habit.goal_mode === "binary") && (
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
      )}
    </HabitCardShell>
  )
}
