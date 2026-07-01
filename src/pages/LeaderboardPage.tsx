import { useState } from "react"
import { Crown } from "lucide-react"
import { useApp } from "@/context/AppContext"
import {
  challengeScoreForPerson,
  completionPctForPerson,
  habitsForPerson,
  isLogComplete,
  logsForHabit,
} from "@/lib/scoring"
import { todayISO } from "@/lib/date"
import { SegmentedControl } from "@/components/layout/SegmentedControl"
import { cn } from "@/lib/utils"

type LbMode = "daily" | "challenge"

export function LeaderboardPage() {
  const { me, data } = useApp()
  const [mode, setMode] = useState<LbMode>("daily")

  if (!me || !data) return null

  const today = todayISO()

  const ranked = data.people
    .map((p) => {
      if (mode === "daily") {
        const habits = habitsForPerson(data.habitsByOwner, p.id)
        const checks = habits.filter((h) =>
          isLogComplete(h, logsForHabit(data.logsByHabit, h.id)[today]),
        ).length
        return {
          p,
          score: completionPctForPerson(p, today, data.habitsByOwner, data.logsByHabit),
          checks,
        }
      }
      return {
        p,
        score: challengeScoreForPerson(p, data.challenge, data.habitsByOwner, data.logsByHabit),
        checks: 0,
      }
    })
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : b.checks - a.checks))

  return (
    <div className="px-5 pt-[calc(12px+env(safe-area-inset-top))]">
      <h1 className="text-3xl font-extrabold">Leaderboard</h1>
      <SegmentedControl
        value={mode}
        onChange={setMode}
        className="mt-4"
        options={[
          { value: "daily", label: "Daily" },
          { value: "challenge", label: "75-day" },
        ]}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        {mode === "daily" ? "Today's completion rate" : "Fixed group challenge window"}
      </p>
      <div className="mt-4 space-y-2">
        {ranked.map((r, i) => (
          <div
            key={r.p.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm",
              r.p.id === me.id && "ring-2 ring-primary/30",
            )}
          >
            <span className="flex w-6 justify-center text-sm font-bold text-muted-foreground">
              {i === 0 ? <Crown className="h-5 w-5 text-amber-500" /> : i + 1}
            </span>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: r.p.color }}
            >
              {r.p.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">
                {r.p.name}
                {r.p.id === me.id && " (you)"}
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${r.score}%`, background: r.p.color }}
                />
              </div>
            </div>
            <span className="text-lg font-extrabold">{r.score}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
