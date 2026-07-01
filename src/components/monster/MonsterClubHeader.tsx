import { Flame, Star } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { challengeWindow } from "@/lib/date"
import {
  challengePointsForPerson,
  maxTotalPoints,
  perfectDays,
} from "@/lib/scoring"
import { getRank, scoreRanksForMax } from "@/lib/ranks"
import { cn } from "@/lib/utils"

export function MonsterClubHeader() {
  const { me, data } = useApp()
  if (!me || !data) return null

  const { dayIndex, days } = challengeWindow(data.challenge)
  const maxScore = maxTotalPoints(undefined, days.length)
  const totalScore = challengePointsForPerson(me, data.challenge, data.habitsByOwner, data.logsByHabit)
  const scoreRanks = scoreRanksForMax(maxScore)
  const scRank = getRank(totalScore, scoreRanks)
  const eligibleDays = days.slice(0, dayIndex)
  const perfect = perfectDays(me, eligibleDays, data.habitsByOwner, data.logsByHabit)

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between border-b border-border px-4 py-2.5 backdrop-blur-md"
      style={{ background: "rgba(7,8,15,0.92)" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Flame className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <div className="font-display text-lg leading-none font-black text-foreground uppercase">
            Monster Club
          </div>
          <div className="font-mono-label text-[10px] text-muted-foreground">
            Day {dayIndex}/{days.length}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-shadow",
            scRank.bg,
            scRank.glow,
          )}
          title={`${perfect} perfect days`}
        >
          <Star className={cn("h-3 w-3", scRank.color)} aria-hidden="true" />
          <span className={cn("font-mono-label text-xs font-bold", scRank.color)}>
            {totalScore}
          </span>
          <span className={cn("font-display text-xs font-black", scRank.color)}>
            {scRank.label}
          </span>
        </div>
        <div
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border text-xs font-bold text-white"
          style={{ background: me.color }}
          aria-hidden="true"
        >
          {me.name.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
