export type RankTier = {
  min: number
  max: number
  label: string
  color: string
  bg: string
  glow: string
}

export const PERFECT_DAY_RANKS: RankTier[] = [
  { min: 70, max: 75, label: "MONSTER", color: "text-amber-400", bg: "bg-amber-400/15 border-amber-400/50", glow: "shadow-[0_0_12px_rgba(251,191,36,0.35)]" },
  { min: 60, max: 69, label: "ALPHA", color: "text-violet-400", bg: "bg-violet-400/15 border-violet-400/50", glow: "shadow-[0_0_12px_rgba(167,139,250,0.35)]" },
  { min: 50, max: 59, label: "WARRIOR", color: "text-cyan-400", bg: "bg-cyan-400/15 border-cyan-400/50", glow: "shadow-[0_0_12px_rgba(34,211,238,0.25)]" },
  { min: 40, max: 49, label: "SURVIVOR", color: "text-emerald-400", bg: "bg-emerald-400/15 border-emerald-400/50", glow: "shadow-[0_0_12px_rgba(52,211,153,0.25)]" },
  { min: 0, max: 39, label: "BEAST", color: "text-[#636890]", bg: "bg-muted border-border", glow: "" },
]

export function scoreRanksForMax(maxScore: number): RankTier[] {
  const m = maxScore || 525
  return [
    { min: Math.round(m * 0.952), max: m, label: "MONSTER", color: "text-amber-400", bg: "bg-amber-400/15 border-amber-400/50", glow: "shadow-[0_0_12px_rgba(251,191,36,0.35)]" },
    { min: Math.round(m * 0.876), max: Math.round(m * 0.951), label: "ALPHA", color: "text-violet-400", bg: "bg-violet-400/15 border-violet-400/50", glow: "shadow-[0_0_12px_rgba(167,139,250,0.35)]" },
    { min: Math.round(m * 0.8), max: Math.round(m * 0.875), label: "WARRIOR", color: "text-cyan-400", bg: "bg-cyan-400/15 border-cyan-400/50", glow: "shadow-[0_0_12px_rgba(34,211,238,0.25)]" },
    { min: Math.round(m * 0.705), max: Math.round(m * 0.799), label: "SURVIVOR", color: "text-emerald-400", bg: "bg-emerald-400/15 border-emerald-400/50", glow: "shadow-[0_0_12px_rgba(52,211,153,0.25)]" },
    { min: 0, max: Math.round(m * 0.704), label: "BEAST", color: "text-[#636890]", bg: "bg-muted border-border", glow: "" },
  ]
}

export function getRank(value: number, tiers: RankTier[]): RankTier {
  return tiers.find((t) => value >= t.min && value <= t.max) ?? tiers[tiers.length - 1]
}
