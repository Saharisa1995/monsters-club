import { useMemo, useState } from "react"
import { List, Zap } from "lucide-react"
import { GoalHabitCard } from "@/components/habits/GoalHabitCard"
import { HabitLibrarySheet } from "@/components/habits/HabitLibrarySheet"
import { useApp } from "@/context/AppContext"
import { challengeWindow } from "@/lib/date"
import { getRank, PERFECT_DAY_RANKS } from "@/lib/ranks"
import {
  CHALLENGE_HABIT_COUNT,
  challengePointsForPerson,
  dailyPoints,
  habitsForPerson,
  isScoringEligible,
  maxTotalPoints,
  perfectDays,
  scoringHabitsForPerson,
} from "@/lib/scoring"
import { todayISO } from "@/lib/date"

export function TodayPage() {
  const { me, data } = useApp()
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [manageHabitId, setManageHabitId] = useState<string | null>(null)

  const habits = useMemo(
    () => (me && data ? habitsForPerson(data.habitsByOwner, me.id) : []),
    [me, data],
  )
  const scoringHabits = useMemo(
    () => (me && data ? scoringHabitsForPerson(data.habitsByOwner, me.id) : []),
    [me, data],
  )

  if (!me || !data) return null

  const today = todayISO()
  const { dayIndex, days, daysRemaining } = challengeWindow(data.challenge)
  const eligibleDays = days.slice(0, dayIndex)
  const maxScore = maxTotalPoints(undefined, days.length)
  const totalScore = challengePointsForPerson(me, data.challenge, data.habitsByOwner, data.logsByHabit)
  const perfectDaysTotal = perfectDays(me, eligibleDays, data.habitsByOwner, data.logsByHabit)
  const todayPoints = dailyPoints(me, today, data.habitsByOwner, data.logsByHabit)
  const rosterOk = isScoringEligible(data.habitsByOwner, me.id)
  const pct = rosterOk
    ? Math.round((todayPoints / CHALLENGE_HABIT_COUNT) * 100)
    : 0
  const perfect = rosterOk && todayPoints === CHALLENGE_HABIT_COUNT
  const pdRank = getRank(perfectDaysTotal, PERFECT_DAY_RANKS)

  return (
    <>
      <div className="flex flex-col gap-5 px-4 py-5">
        <div className="relative overflow-hidden rounded-xl border border-[rgba(255,107,53,0.3)] p-5 monster-hero-gradient">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
                Monster Club
              </p>
              <h1 className="font-display text-6xl leading-none font-black text-foreground">
                DAY <span className="text-primary">{dayIndex}</span>
              </h1>
              <p className="mt-2 font-mono-label text-xs text-muted-foreground">
                {daysRemaining} days remaining
              </p>
            </div>
            <div className="text-right">
              <div className="mb-1 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
                Today
              </div>
              <div className="font-display text-5xl leading-none font-black text-primary">
                {todayPoints}
                <span className="text-2xl text-muted-foreground">/{CHALLENGE_HABIT_COUNT}</span>
              </div>
              <div className="mt-1 font-mono-label text-[10px] text-muted-foreground">pts today</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between font-mono-label text-[10px] text-muted-foreground">
              <span>
                {todayPoints} of {CHALLENGE_HABIT_COUNT} habits
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div
            className="rounded-lg border border-[rgba(255,107,53,0.35)] p-3 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(13,16,32,0) 100%)",
            }}
          >
            <div className="mb-1 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
              Total Score
            </div>
            <div className="font-display text-2xl font-black text-primary">{totalScore}</div>
            <div className="font-mono-label text-[10px] text-muted-foreground">/{maxScore}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <div className="mb-1 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
              Perfect Days
            </div>
            <div className="font-display text-2xl font-black text-foreground">{perfectDaysTotal}</div>
            <div className="font-mono-label text-[10px] text-muted-foreground">/{days.length}</div>
          </div>
          <div className={`rounded-lg border p-3 text-center ${pdRank.bg} ${pdRank.glow}`}>
            <div className="mb-1 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
              Rank
            </div>
            <div className={`font-display text-lg leading-tight font-black ${pdRank.color}`}>
              {pdRank.label}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-black tracking-wide text-foreground uppercase">
              {habits.length}/{CHALLENGE_HABIT_COUNT} Daily Habits
            </h2>
            <button
              type="button"
              onClick={() => {
                setManageHabitId(null)
                setLibraryOpen(true)
              }}
              className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono-label text-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Open habit library"
            >
              <List className="h-3.5 w-3.5" />
              Habits
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {habits.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No habits yet. Tap Habits to build your {CHALLENGE_HABIT_COUNT}-habit roster.
              </p>
            ) : (
              scoringHabits.map((h, idx) => (
                <GoalHabitCard
                  key={h.id}
                  habit={h}
                  index={idx}
                  logDate={today}
                  logsByHabit={data.logsByHabit}
                  onManage={(id) => {
                    setManageHabitId(id)
                    setLibraryOpen(true)
                  }}
                />
              ))
            )}
          </div>
        </div>

        {perfect && (
          <div
            className="flex items-center gap-3 rounded-xl border border-amber-400/50 p-4 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(255,107,53,0.08) 100%)",
            }}
          >
            <Zap className="h-8 w-8 shrink-0 text-amber-400" aria-hidden="true" />
            <div>
              <div className="font-display text-2xl font-black text-amber-400 uppercase">
                Perfect Day!
              </div>
              <div className="font-mono-label text-xs text-muted-foreground">
                {CHALLENGE_HABIT_COUNT}/{CHALLENGE_HABIT_COUNT} habits — Be average or be a Monster.
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <div className="mb-2 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
            How it works
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              "7 habits required for scoring and ranks",
              "Partial progress shows on the bar — no partial points",
              "Perfect Day = all habits complete",
            ].map((line) => (
              <div key={line} className="flex items-center gap-2 font-mono-label text-xs text-foreground/80">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      <HabitLibrarySheet
        open={libraryOpen}
        onOpenChange={(v) => {
          setLibraryOpen(v)
          if (!v) setManageHabitId(null)
        }}
        habits={habits}
        initialHabitId={manageHabitId}
      />
    </>
  )
}
