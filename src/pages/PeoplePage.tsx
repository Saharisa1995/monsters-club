import { LogOut, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/AppContext"
import { supabase } from "@/lib/supabase"
import { habitsForPerson, scoreForPersonOverDays } from "@/lib/scoring"

function last7ISO(): string[] {
  const arr: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    arr.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    )
  }
  return arr
}

export function PeoplePage() {
  const { me, data, refresh, signOut } = useApp()

  if (!me || !data) return null

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
    <div className="px-5 pt-[calc(12px+env(safe-area-inset-top))]">
      <h1 className="text-3xl font-extrabold">People</h1>
      <p className="mt-1 text-sm text-muted-foreground">{data.people.length} members</p>
      {!me.is_admin && (
        <p className="mt-2 text-xs text-muted-foreground">
          Share the app link so friends can sign up. Only admins can remove members.
        </p>
      )}
      <div className="mt-4 space-y-2">
        {data.people.map((p) => {
          const habits = habitsForPerson(data.habitsByOwner, p.id)
          const weekScore = scoreForPersonOverDays(
            p,
            last7ISO(),
            data.habitsByOwner,
            data.logsByHabit,
          )
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: p.color }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-bold">
                  {p.name}
                  {p.id === me.id && " (you)"}
                  {p.is_admin && (
                    <Badge variant="secondary" className="text-[10px]">
                      ADMIN
                    </Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {habits.length} habits · {weekScore}% this week
                </p>
              </div>
              {me.is_admin && p.id !== me.id && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="shrink-0 rounded-xl"
                  onClick={() => removeMember(p.id, p.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-8 mb-4 h-12 w-full rounded-2xl font-bold"
        onClick={() => signOut()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </Button>
    </div>
  )
}
