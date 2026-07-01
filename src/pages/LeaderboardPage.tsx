import { useState } from "react"
import { Lock } from "lucide-react"
import { toast } from "sonner"
import { RankBadge } from "@/components/monster/RankBadge"
import { useApp } from "@/context/AppContext"
import { challengeWindow } from "@/lib/date"
import { isFeatureEnabled } from "@/lib/featureFlags"
import { getRank, scoreRanksForMax } from "@/lib/ranks"
import {
  challengePointsForPerson,
  dailyPoints,
  isScoringEligible,
  maxTotalPoints,
  perfectDays,
} from "@/lib/scoring"
import { todayISO } from "@/lib/date"
import { cn } from "@/lib/utils"

type Scope = "individual" | "group"

export function LeaderboardPage() {
  const { me, data } = useApp()
  const [scope, setScope] = useState<Scope>("individual")

  if (!me || !data) return null

  const today = todayISO()
  const { days, dayIndex } = challengeWindow(data.challenge)
  const eligibleDays = days.slice(0, dayIndex)

  const ranked = data.people
    .map((p) => {
      const eligible = isScoringEligible(data.habitsByOwner, p.id)
      const maxScore = maxTotalPoints(undefined, days.length)
      const totalScore = challengePointsForPerson(
        p,
        data.challenge,
        data.habitsByOwner,
        data.logsByHabit,
      )
      const perfect = perfectDays(p, eligibleDays, data.habitsByOwner, data.logsByHabit)
      const todayPts = dailyPoints(p, today, data.habitsByOwner, data.logsByHabit)
      const scoreRank = getRank(totalScore, scoreRanksForMax(maxScore))
      return { p, totalScore, maxScore, perfect, todayPts, scoreRank, eligible }
    })
    .sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1
      return b.totalScore - a.totalScore
    })

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="font-display text-5xl font-black uppercase">Leaderboard</h1>
        <p className="mt-1 font-mono-label text-xs text-muted-foreground">
          Monster Club global rankings
        </p>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(["individual", "group"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              if (s === "group" && !isFeatureEnabled("groupLeaderboard")) {
                toast.info("Group rankings coming soon")
                return
              }
              setScope(s)
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              scope === s ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
            {s === "group" && !isFeatureEnabled("groupLeaderboard") && (
              <Lock className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {scope === "individual" && (
        <div className="flex flex-col gap-2">
          {ranked.map((r, i) => {
            const isMe = r.p.id === me.id
            return (
              <div
                key={r.p.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 transition-all",
                  isMe
                    ? "habit-row-checked border-[rgba(255,107,53,0.5)]"
                    : "border-border bg-card",
                )}
              >
                <div className="w-7 shrink-0 text-center">
                  {i < 3 ? (
                    <span className="text-lg">{medals[i]}</span>
                  ) : (
                    <span className="font-mono-label text-xs text-muted-foreground">#{i + 1}</span>
                  )}
                </div>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: r.p.color }}
                >
                  {r.p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-sm font-semibold", isMe && "text-primary")}>
                    {r.p.name}
                    {isMe && (
                      <span className="font-mono-label text-[10px] text-muted-foreground"> (you)</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="font-mono-label text-[10px] text-muted-foreground">
                      Day {dayIndex} · {r.perfect} perfect · {r.todayPts} today
                      {!r.eligible && " · incomplete roster"}
                    </span>
                    <RankBadge {...r.scoreRank} />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className={cn(
                      "font-display text-2xl font-black",
                      isMe ? "text-primary" : "text-foreground",
                    )}
                  >
                    {r.totalScore}
                  </div>
                  <div className="font-mono-label text-[10px] text-muted-foreground">
                    /{r.maxScore}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
