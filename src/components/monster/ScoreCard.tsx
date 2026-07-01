import {
  getRank,
  PERFECT_DAY_RANKS,
  scoreRanksForMax,
  type RankTier,
} from "@/lib/ranks"
import { RankBadge } from "./RankBadge"

type ScoreCardProps = {
  perfectDays: number
  totalScore: number
  maxScore: number
  durationDays?: number
}

function TierLegend({
  tiers,
  activeLabel,
  valueKey,
}: {
  tiers: RankTier[]
  activeLabel: string
  valueKey: "range" | "score"
}) {
  return (
    <div className="mt-4 flex flex-col gap-1">
      {tiers.map((r) => (
        <div
          key={r.label}
          className={`flex items-center justify-between rounded px-2 py-0.5 font-mono-label text-[10px] ${
            r.label === activeLabel ? "bg-primary/10" : ""
          }`}
        >
          <span className={r.label === activeLabel ? "font-bold text-primary" : "text-muted-foreground"}>
            {valueKey === "score" ? `${r.min}–${r.max}` : `${r.min}–${r.max} days`}
          </span>
          <span className={r.label === activeLabel ? `${r.color} font-bold` : "text-muted-foreground"}>
            {r.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ScoreCard({
  perfectDays,
  totalScore,
  maxScore,
  durationDays = 75,
}: ScoreCardProps) {
  const pdRank = getRank(perfectDays, PERFECT_DAY_RANKS)
  const scoreRanks = scoreRanksForMax(maxScore)
  const scRank = getRank(totalScore, scoreRanks)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="monster-header-gradient flex items-center justify-between border-b border-[rgba(255,107,53,0.2)] px-4 py-3">
        <div>
          <div className="font-display text-2xl leading-none font-black tracking-wide text-foreground uppercase">
            Monster Club
          </div>
          <div className="mt-0.5 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
            {durationDays} Day Challenge
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
            Discipline Today
          </div>
          <div className="font-mono-label text-[10px] tracking-widest text-primary uppercase">
            Freedom Tomorrow
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="p-5">
          <div className="mb-1 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
            Perfect Days
          </div>
          <div className="mb-3 font-mono-label text-[10px] text-muted-foreground">
            A perfect day = all habits complete
          </div>
          <div className="font-display text-6xl leading-none font-black text-foreground">
            {perfectDays}
          </div>
          <div className="mb-4 font-mono-label text-xs text-muted-foreground">
            out of {durationDays} days
          </div>
          <RankBadge {...pdRank} />
          <TierLegend tiers={PERFECT_DAY_RANKS} activeLabel={pdRank.label} valueKey="range" />
        </div>

        <div className="p-5">
          <div className="mb-1 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
            Total Score
          </div>
          <div className="mb-3 font-mono-label text-[10px] text-muted-foreground">
            1 pt per habit per day
          </div>
          <div className="font-display text-6xl leading-none font-black text-primary">
            {totalScore}
          </div>
          <div className="mb-4 font-mono-label text-xs text-muted-foreground">
            out of {maxScore}
          </div>
          <RankBadge {...scRank} />
          <TierLegend tiers={scoreRanks} activeLabel={scRank.label} valueKey="score" />
        </div>
      </div>

      <div className="border-t border-border bg-muted/40 px-4 py-3">
        <div className="grid grid-cols-3 divide-x divide-border text-center">
          <div className="pr-3">
            <div className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
              Summary
            </div>
          </div>
          <div className="px-3">
            <div className="font-mono-label text-[10px] text-muted-foreground">Perfect Days</div>
            <div className="font-display text-lg leading-none font-black text-foreground">
              {perfectDays}/{durationDays}
            </div>
          </div>
          <div className="pl-3">
            <div className="font-mono-label text-[10px] text-muted-foreground">Total Score</div>
            <div className="font-display text-lg leading-none font-black text-primary">
              {totalScore}/{maxScore}
            </div>
          </div>
        </div>
        <div className="mt-3 text-center font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
          Discipline is choice. Every day. No excuses.
        </div>
      </div>
    </div>
  )
}
