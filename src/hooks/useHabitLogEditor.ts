import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { deleteHabitLog, upsertHabitLog } from "@/lib/api"
import { isLogComplete } from "@/lib/scoring"
import type { Habit, HabitLog } from "@/lib/types"
import { useApp } from "@/context/AppContext"

function logDone(habit: Habit, value: number): boolean {
  if (habit.goal_mode === "binary") return value >= 1
  return value >= habit.goal_target
}

export function useHabitLogEditor(
  habit: Habit,
  logDate: string,
  log: HabitLog | undefined,
) {
  const { me, applyHabitLog, clearHabitLog } = useApp()
  const [value, setValue] = useState(log?.value ?? 0)
  const [metadata, setMetadata] = useState<Record<string, unknown>>(log?.metadata ?? {})
  const editingRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const persistGenRef = useRef(0)

  useEffect(() => {
    if (editingRef.current) return
    setValue(log?.value ?? 0)
    setMetadata(log?.metadata ?? {})
  }, [habit.id, logDate, log?.value, log?.completed, log?.metadata, log?.id])

  const applyOptimistic = useCallback(
    (nextValue: number, nextMeta: Record<string, unknown>) => {
      if (!me) return
      if (nextValue <= 0) {
        clearHabitLog(habit.id, logDate)
        return
      }
      applyHabitLog({
        id: log?.id ?? `optimistic-${habit.id}-${logDate}`,
        habit_id: habit.id,
        owner_id: me.id,
        log_date: logDate,
        value: nextValue,
        completed: logDone(habit, nextValue),
        metadata: nextMeta,
        created_at: log?.created_at ?? new Date().toISOString(),
      })
    },
    [applyHabitLog, clearHabitLog, habit, log?.created_at, log?.id, logDate, me],
  )

  const persist = useCallback(
    async (nextValue: number, nextMeta: Record<string, unknown>) => {
      if (!me) return
      const gen = ++persistGenRef.current
      const done = logDone(habit, nextValue)
      try {
        if (nextValue <= 0) {
          await deleteHabitLog(habit.id, logDate)
          if (gen === persistGenRef.current) clearHabitLog(habit.id, logDate)
        } else {
          const saved = await upsertHabitLog(habit, me.id, logDate, nextValue, done, nextMeta)
          if (gen === persistGenRef.current) applyHabitLog(saved)
        }
        if (gen === persistGenRef.current) editingRef.current = false
      } catch (e) {
        editingRef.current = false
        toast.error(e instanceof Error ? e.message : "Couldn't save")
        throw e
      }
    },
    [applyHabitLog, clearHabitLog, habit, logDate, me],
  )

  const setDraft = useCallback(
    (nextValue: number, nextMeta?: Record<string, unknown>) => {
      editingRef.current = true
      const meta = nextMeta ?? metadata
      setValue(nextValue)
      if (nextMeta) setMetadata(nextMeta)
      applyOptimistic(nextValue, meta)
    },
    [applyOptimistic, metadata],
  )

  const commit = useCallback(
    (nextValue?: number, nextMeta?: Record<string, unknown>) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
        debounceRef.current = null
      }
      const v = nextValue ?? value
      const m = nextMeta ?? metadata
      setDraft(v, m)
      return persist(v, m)
    },
    [metadata, persist, setDraft, value],
  )

  /** For rapid discrete taps (cups, +/-) — one optimistic UI update, debounced network save */
  const commitDebounced = useCallback(
    (nextValue: number, nextMeta?: Record<string, unknown>, delayMs = 450) => {
      const m = nextMeta ?? metadata
      setDraft(nextValue, m)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        void persist(nextValue, m)
      }, delayMs)
    },
    [metadata, persist, setDraft],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const toggleBinary = useCallback(
    async (done: boolean) => {
      if (!me) return
      editingRef.current = true
      try {
        if (!done) {
          setValue(0)
          clearHabitLog(habit.id, logDate)
          await deleteHabitLog(habit.id, logDate)
        } else {
          setValue(1)
          const saved = await upsertHabitLog(habit, me.id, logDate, 1, true, {})
          applyHabitLog(saved)
        }
        editingRef.current = false
      } catch (e) {
        editingRef.current = false
        toast.error(e instanceof Error ? e.message : "Couldn't save")
      }
    },
    [applyHabitLog, clearHabitLog, habit, logDate, me],
  )

  const completed = isLogComplete(
    habit,
    value <= 0
      ? undefined
      : ({
          value,
          completed: logDone(habit, value),
        } as HabitLog),
  )

  return {
    value,
    metadata,
    completed,
    setDraft,
    commit,
    commitDebounced,
    toggleBinary,
  }
}
