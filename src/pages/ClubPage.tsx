import { useState } from "react"
import { Lock, LogOut, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { RankBadge } from "@/components/monster/RankBadge"
import { LockedFeature } from "@/components/monster/LockedFeature"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import { isFeatureEnabled } from "@/lib/featureFlags"
import { challengeWindow } from "@/lib/date"
import {
  challengePointsForPerson,
  perfectDays,
} from "@/lib/scoring"
import { getRank, PERFECT_DAY_RANKS } from "@/lib/ranks"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const GHOST_GROUPS = [
  { emoji: "⚔️", name: "Iron Covenant", members: 124 },
  { emoji: "🌅", name: "Dawn Patrol", members: 87 },
  { emoji: "🔥", name: "No Excuses", members: 312 },
]

export function ClubPage() {
  const { me, data, refresh, signOut } = useApp()
  const [tab, setTab] = useState<"groups" | "people">("people")

  if (!me || !data) return null

  const { days, dayIndex } = challengeWindow(data.challenge)
  const eligibleDays = days.slice(0, dayIndex)

  async function removeMember(id: string, name: string) {
    if (!confirm(`Remove ${name} and all their data?`)) return
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id)
      if (error) throw error
      await refresh()
      toast.success(`Removed ${name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove")
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-5">
      <div>
        <h1 className="font-display text-5xl font-black uppercase">Community</h1>
        <p className="mt-1 font-mono-label text-xs text-muted-foreground">
          Join groups, follow challengers
        </p>
      </div>

      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(["groups", "people"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-semibold capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              tab === t ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {t === "groups" && !isFeatureEnabled("groups") && (
              <Lock className="h-3 w-3" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      {tab === "groups" && (
        <div className="flex flex-col gap-3">
          {!isFeatureEnabled("groups") ? (
            <LockedFeature title="Groups" description="Join and create challenge groups">
              <div className="space-y-3 p-4">
                {GHOST_GROUPS.map((g) => (
                  <div
                    key={g.name}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <span className="text-3xl">{g.emoji}</span>
                    <div>
                      <p className="font-display text-lg font-bold uppercase">{g.name}</p>
                      <p className="font-mono-label text-[10px] text-muted-foreground">
                        {g.members} members
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </LockedFeature>
          ) : null}
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            Create Group — coming soon
          </button>
        </div>
      )}

      {tab === "people" && (
        <div className="flex flex-col gap-2.5">
          {data.people.map((p) => {
            const score = challengePointsForPerson(
              p,
              data.challenge,
              data.habitsByOwner,
              data.logsByHabit,
            )
            const perfect = perfectDays(p, eligibleDays, data.habitsByOwner, data.logsByHabit)
            const rank = getRank(perfect, PERFECT_DAY_RANKS)

            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: p.color }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {p.name}
                    {p.id === me.id && (
                      <span className="font-mono-label text-[10px] text-muted-foreground"> (you)</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono-label text-[10px] text-muted-foreground">
                      Day {dayIndex}
                    </span>
                    <span className="font-mono-label text-[10px] text-primary">{score}pts</span>
                    <RankBadge {...rank} />
                  </div>
                </div>
                {isFeatureEnabled("followUsers") ? null : (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    aria-label="Follow coming soon"
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 font-mono-label text-[10px] text-muted-foreground"
                  >
                    <Lock className="h-3 w-3" />
                    Follow
                  </button>
                )}
                {me.is_admin && p.id !== me.id && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeMember(p.id, p.name)}
                    aria-label={`Remove ${p.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            className="mt-4 h-12 w-full rounded-xl font-bold"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      )}
    </div>
  )
}
