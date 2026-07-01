import { useMemo, useState } from "react"
import { DateStrip } from "@/components/layout/DateStrip"
import { FloatingAddButton } from "@/components/layout/FloatingAddButton"
import { HabitCard } from "@/components/habits/HabitCard"
import { CreateHabitSheet } from "@/components/habits/CreateHabitSheet"
import { useApp } from "@/context/AppContext"
import {
  completionPctForPerson,
  habitsForPerson,
  isLogComplete,
  logsForHabit,
} from "@/lib/scoring"
import { todayISO } from "@/lib/date"
import { Progress } from "@/components/ui/progress"

export function TodayPage() {
  const { me, data, selectedDay, setSelectedDay } = useApp()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const habits = useMemo(
    () => (me && data ? habitsForPerson(data.habitsByOwner, me.id) : []),
    [me, data],
  )

  const pct = useMemo(() => {
    if (!me || !data) return 0
    return completionPctForPerson(me, selectedDay, data.habitsByOwner, data.logsByHabit)
  }, [me, data, selectedDay])

  const doneCount = useMemo(() => {
    if (!data) return 0
    return habits.filter((h) =>
      isLogComplete(h, logsForHabit(data.logsByHabit, h.id)[selectedDay]),
    ).length
  }, [habits, data, selectedDay])

  const hasProgress = (iso: string) => {
    if (!me || !data) return false
    return habits.some((h) => isLogComplete(h, logsForHabit(data.logsByHabit, h.id)[iso]))
  }

  const isToday = selectedDay === todayISO()

  return (
    <>
      <header className="px-5 pt-[calc(12px+env(safe-area-inset-top))] pb-2">
        <h1 className="text-3xl font-extrabold">{isToday ? "Today" : "Habits"}</h1>
        <p className="text-sm font-medium text-muted-foreground">
          {doneCount} of {habits.length} done · {pct}%
        </p>
      </header>

      <DateStrip selected={selectedDay} onSelect={setSelectedDay} hasProgress={hasProgress} />

      <div className="mt-2 space-y-3 px-5">
        {habits.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No habits yet. Tap + to add one.
          </p>
        ) : (
          habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              logDate={selectedDay}
              expanded={expandedId === h.id}
              onToggleExpand={() =>
                setExpandedId((id) => (id === h.id ? null : h.id))
              }
            />
          ))
        )}
      </div>

      <div className="mx-5 mt-6 rounded-3xl bg-card p-4 shadow-sm">
        <p className="mb-2 text-sm font-bold">Daily progress</p>
        <Progress value={pct} className="h-3" />
      </div>

      <FloatingAddButton onClick={() => setCreateOpen(true)} />
      <CreateHabitSheet open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
