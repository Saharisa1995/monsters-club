import { useState } from "react"
import {
  BookOpen,
  Camera,
  Droplets,
  Dumbbell,
  Salad,
  ShowerHead,
  Sun,
  Target,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { ScoreCard } from "@/components/monster/ScoreCard"
import { LockedFeature } from "@/components/monster/LockedFeature"
import { useApp } from "@/context/AppContext"
import { challengeWindow, todayISO } from "@/lib/date"
import { updateChallengeStart } from "@/lib/api"
import {
  dailyPoints,
  eligibleHabitsForDay,
  habitCompletionRate,
  habitsForPerson,
  maxTotalPoints,
  perfectDays,
  totalPoints,
} from "@/lib/scoring"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const ICON_MAP: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  sun: Sun,
  droplets: Droplets,
  salad: Salad,
  "book-open": BookOpen,
  camera: Camera,
  "shower-head": ShowerHead,
  target: Target,
}

export function ProgressPage() {
  const { me, data, refresh } = useApp()
  const [startEdit, setStartEdit] = useState("")

  if (!me || !data) return null

  const { days, dayIndex, daysRemaining, start, end } = challengeWindow(data.challenge)
  const habits = habitsForPerson(data.habitsByOwner, me.id)
  const eligibleDays = days.slice(0, dayIndex)
  const maxScore = maxTotalPoints(undefined, days.length)
  const totalScore = totalPoints(me, eligibleDays, data.habitsByOwner, data.logsByHabit)
  const perfectDaysTotal = perfectDays(me, eligibleDays, data.habitsByOwner, data.logsByHabit)
  const overallPct = Math.round((dayIndex / days.length) * 100)
  const today = todayISO()

  async function saveStart() {
    if (!startEdit || !me?.is_admin) return
    try {
      await updateChallengeStart(startEdit, me.id)
      await refresh()
      toast.success("Challenge start date updated")
      setStartEdit("")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update")
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="font-display text-5xl font-black uppercase">Progress</h1>
        <p className="mt-1 font-mono-label text-xs text-muted-foreground">
          Day {dayIndex}/{days.length} — {overallPct}% complete · {daysRemaining} left
        </p>
        <p className="font-mono-label text-[10px] text-muted-foreground">
          {start} → {end}
        </p>
      </div>

      <ScoreCard
        perfectDays={perfectDaysTotal}
        totalScore={totalScore}
        maxScore={maxScore}
        durationDays={days.length}
      />

      <LockedFeature title="Recent Performance" description="Score chart coming soon">
        <div className="h-32 rounded-xl border border-border bg-card p-4">
          <div className="flex h-full items-end gap-1">
            {Array.from({ length: 14 }, (_, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/60"
                style={{ height: `${30 + (i % 5) * 12}%` }}
              />
            ))}
          </div>
        </div>
      </LockedFeature>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-display text-base font-black text-foreground uppercase">
          {days.length}-Day Grid
        </h3>
        <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
          {days.map((iso, i) => {
            const dayNum = i + 1
            const isToday = iso === today
            const isFuture = iso > today
            const dayHabits = eligibleHabitsForDay(me, iso, data.habitsByOwner)
            const cnt = isFuture ? 0 : dailyPoints(me, iso, data.habitsByOwner, data.logsByHabit)
            const total = dayHabits.length
            const perf = total > 0 && cnt === total
            const partial = cnt > 0 && !perf

            return (
              <div
                key={iso}
                title={`Day ${dayNum}${!isFuture ? `: ${cnt}/${total} habits` : ""}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-sm",
                  isFuture && "bg-muted/30",
                  !isFuture && perf && "bg-primary",
                  !isFuture && partial && "bg-primary/40",
                  !isFuture && cnt === 0 && iso <= today && "bg-destructive/30",
                  isToday && "bg-primary/20 ring-1 ring-primary ring-offset-1 ring-offset-card",
                )}
              >
                <span
                  className={cn(
                    "font-mono-label text-[7px]",
                    isFuture ? "text-muted-foreground/30" : perf ? "text-white" : "text-foreground/50",
                  )}
                >
                  {dayNum}
                </span>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {[
            ["bg-primary", "Perfect"],
            ["bg-primary/40", "Partial"],
            ["bg-destructive/30", "Missed"],
            ["bg-muted/30", "Future"],
          ].map(([cls, label]) => (
            <div key={label} className="flex items-center gap-1">
              <div className={cn("h-2.5 w-2.5 rounded-sm", cls)} />
              <span className="font-mono-label text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-display text-base font-black text-foreground uppercase">
          Habit Completion Rate
        </h3>
        <div className="flex flex-col gap-2.5">
          {habits.map((habit) => {
            const rate = habitCompletionRate(habit, eligibleDays, data.logsByHabit)
            const Icon = ICON_MAP[habit.icon] ?? Target
            return (
              <div key={habit.id} className="flex items-center gap-2.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between font-mono-label text-[10px]">
                    <span className="text-foreground">{habit.name}</span>
                    <span className="text-muted-foreground">{rate}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {me.is_admin && (
        <div className="rounded-xl border border-border bg-card p-4">
          <Label className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
            Admin: challenge start
          </Label>
          <div className="mt-2 flex gap-2">
            <Input
              type="date"
              value={startEdit || start}
              onChange={(e) => setStartEdit(e.target.value)}
              className="rounded-lg bg-input-background"
            />
            <Button type="button" onClick={saveStart} className="shrink-0">
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
