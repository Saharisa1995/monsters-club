import { challengeWindow } from "@/lib/date"
import {
  challengeScoreForPerson,
  completionPctForPerson,
  dayMeetsThreshold,
  habitsForPerson,
} from "@/lib/scoring"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateChallengeStart } from "@/lib/api"
import { toast } from "sonner"
import { useState } from "react"

const THRESHOLD = 80

export function ChallengePage() {
  const { me, data, refresh } = useApp()
  const [startEdit, setStartEdit] = useState("")

  if (!me || !data) return null

  const { days, dayIndex, daysRemaining, start, end } = challengeWindow(data.challenge)
  const myScore = challengeScoreForPerson(me, data.challenge, data.habitsByOwner, data.logsByHabit)

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
    <div className="px-5 pt-[calc(12px+env(safe-area-inset-top))]">
      <h1 className="text-3xl font-extrabold">75-Day Challenge</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Day {dayIndex} of {days.length} · {daysRemaining} days left
      </p>
      <p className="text-xs text-muted-foreground">
        {start} → {end}
      </p>

      <div className="mt-4 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-300/30 p-5 shadow-sm">
        <p className="text-sm font-bold text-foreground/70">Your challenge score</p>
        <p className="text-5xl font-extrabold">{myScore}%</p>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-bold">Your progress grid</p>
        <div className="grid grid-cols-15 gap-1.5" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
          {days.map((iso, i) => {
            const met = dayMeetsThreshold(
              me,
              iso,
              THRESHOLD,
              data.habitsByOwner,
              data.logsByHabit,
            )
            const pct = completionPctForPerson(
              me,
              iso,
              data.habitsByOwner,
              data.logsByHabit,
            )
            return (
              <div
                key={iso}
                title={`Day ${i + 1}: ${pct}%`}
                className={cn(
                  "aspect-square rounded-md",
                  met ? "bg-primary" : pct > 0 ? "bg-primary/30" : "bg-muted",
                  iso > new Date().toISOString().slice(0, 10) && "opacity-30",
                )}
              />
            )
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Filled = {THRESHOLD}%+ habits done that day
        </p>
      </div>

      {me.is_admin && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-4">
          <Label className="text-xs font-bold uppercase">Admin: challenge start</Label>
          <div className="mt-2 flex gap-2">
            <Input
              type="date"
              value={startEdit || start}
              onChange={(e) => setStartEdit(e.target.value)}
              className="rounded-xl"
            />
            <Button type="button" onClick={saveStart} className="rounded-xl shrink-0">
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 mb-4">
        <p className="mb-2 text-sm font-bold">Group snapshot</p>
        <div className="space-y-2">
          {data.people.map((p) => {
            const score = challengeScoreForPerson(
              p,
              data.challenge,
              data.habitsByOwner,
              data.logsByHabit,
            )
            const habitCount = habitsForPerson(data.habitsByOwner, p.id).length
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: p.color }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold">
                    {p.name}
                    {p.id === me.id && " (you)"}
                  </p>
                  <p className="text-xs text-muted-foreground">{habitCount} habits</p>
                </div>
                <p className="text-lg font-extrabold">{score}%</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
