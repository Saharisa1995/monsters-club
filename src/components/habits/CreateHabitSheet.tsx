import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SegmentedControl } from "@/components/layout/SegmentedControl"
import { supabase } from "@/lib/supabase"
import type { GoalMode } from "@/lib/types"
import { useApp } from "@/context/AppContext"
import { toast } from "sonner"

const fieldClass = "mt-1.5 h-12 rounded-2xl text-base"

type CreateHabitSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateHabitSheet({ open, onOpenChange }: CreateHabitSheetProps) {
  const { me, data, refresh } = useApp()
  const [name, setName] = useState("")
  const [goalMode, setGoalMode] = useState<GoalMode>("count")
  const [target, setTarget] = useState("10")
  const [unit, setUnit] = useState("times")
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!me || !name.trim()) {
      toast.error("Enter a habit name")
      return
    }
    setSaving(true)
    try {
      const habits = data?.habitsByOwner[me.id] ?? []
      const v2Row = {
        owner_id: me.id,
        name: name.trim(),
        icon: goalMode === "duration" ? "timer" : "target",
        color_idx: habits.length % 8,
        freq: "daily",
        habit_type: "custom",
        goal_mode: goalMode,
        goal_target: Number(target) || 1,
        goal_unit: goalMode === "duration" ? "min" : unit,
        sort_order: habits.length,
        is_preset: false,
      }
      const v2 = await supabase.from("habits").insert(v2Row)
      if (v2.error) {
        const v1 = await supabase.from("habits").insert({
          owner_id: me.id,
          name: name.trim(),
          icon: goalMode === "duration" ? "timer" : "target",
          color_idx: habits.length % 8,
          freq: "daily",
        })
        if (v1.error) throw v1.error
        if (!data?.schemaV2) toast.message("Basic habit saved. Run schema-migration-v2.sql for full tracking.")
      }
      setName("")
      setTarget("10")
      onOpenChange(false)
      await refresh()
      toast.success("Habit created")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create habit")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90dvh] max-w-[480px] rounded-t-3xl border-t px-5 pb-[calc(20px+env(safe-area-inset-bottom))]"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">New custom habit</SheetTitle>
        </SheetHeader>
        <div className="mt-5 space-y-5">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meditate"
              className={fieldClass}
            />
          </div>
          <div>
            <Label className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Goal mode
            </Label>
            <SegmentedControl
              value={goalMode}
              onChange={setGoalMode}
              options={[
                { value: "count", label: "Count" },
                { value: "duration", label: "Duration" },
              ]}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Target
              </Label>
              <Input
                type="number"
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className={fieldClass}
              />
            </div>
            {goalMode === "count" && (
              <div className="flex-1">
                <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Unit
                </Label>
                <Input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="times"
                  className={fieldClass}
                />
              </div>
            )}
          </div>
          <Button
            type="button"
            className="h-12 w-full rounded-2xl text-base font-bold"
            disabled={saving}
            onClick={create}
          >
            {saving ? "Creating…" : "Create habit"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
