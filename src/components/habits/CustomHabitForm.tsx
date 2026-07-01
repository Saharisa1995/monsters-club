import { Timer, Target, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SegmentedControl } from "@/components/layout/SegmentedControl"
import {
  COUNT_UNIT_PRESETS,
  formatCustomGoalLabel,
  type CustomGoalKind,
  type CustomHabitDraft,
} from "@/lib/customHabit"
import { cn } from "@/lib/utils"

const inputClass = "mt-1.5 h-12 rounded-lg bg-input-background text-base"

type CustomHabitFormProps = {
  draft: CustomHabitDraft
  onChange: (draft: CustomHabitDraft) => void
  onSubmit: () => void
  submitLabel: string
  loading?: boolean
  disabled?: boolean
  idPrefix?: string
}

export function CustomHabitForm({
  draft,
  onChange,
  onSubmit,
  submitLabel,
  loading = false,
  disabled = false,
  idPrefix = "custom",
}: CustomHabitFormProps) {
  const preview = formatCustomGoalLabel(draft)
  const GoalIcon: LucideIcon = draft.goalKind === "duration" ? Timer : Target

  function setGoalKind(goalKind: CustomGoalKind) {
    onChange({
      ...draft,
      goalKind,
      unit: goalKind === "duration" ? "min" : draft.unit || "times",
      target: goalKind === "duration" && draft.target > 180 ? 30 : draft.target,
    })
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <GoalIcon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {draft.name.trim() || "Your custom habit"}
          </p>
          <p className="font-mono-label text-[11px] text-muted-foreground">{preview}</p>
        </div>
      </div>

      <div>
        <Label
          htmlFor={`${idPrefix}-name`}
          className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase"
        >
          Name
        </Label>
        <Input
          id={`${idPrefix}-name`}
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          placeholder="e.g. Stretch, Study, Walk"
          maxLength={48}
          autoComplete="off"
          className={inputClass}
        />
      </div>

      <div>
        <Label className="mb-2 block font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
          Goal type
        </Label>
        <SegmentedControl
          value={draft.goalKind}
          onChange={setGoalKind}
          options={[
            { value: "count", label: "Count" },
            { value: "duration", label: "Duration" },
          ]}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {draft.goalKind === "count"
            ? "Track a number each day (reps, pages, glasses…)."
            : "Track minutes with a slider on Today."}
        </p>
      </div>

      <div className={cn("flex flex-col gap-4", draft.goalKind === "count" && "sm:flex-row")}>
        <div className="flex-1">
          <Label
            htmlFor={`${idPrefix}-target`}
            className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase"
          >
            Daily target
          </Label>
          <Input
            id={`${idPrefix}-target`}
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            value={draft.target}
            onChange={(e) =>
              onChange({ ...draft, target: Math.max(1, Number(e.target.value) || 1) })
            }
            className={inputClass}
          />
        </div>
        {draft.goalKind === "count" ? (
          <div className="flex-1">
            <Label
              htmlFor={`${idPrefix}-unit`}
              className="font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase"
            >
              Unit
            </Label>
            <Input
              id={`${idPrefix}-unit`}
              value={draft.unit}
              onChange={(e) => onChange({ ...draft, unit: e.target.value })}
              placeholder="times"
              maxLength={24}
              className={inputClass}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-end pb-1">
            <p className="font-mono-label text-sm text-muted-foreground">minutes (min)</p>
          </div>
        )}
      </div>

      {draft.goalKind === "count" && (
        <div className="flex flex-wrap gap-2">
          {COUNT_UNIT_PRESETS.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => onChange({ ...draft, unit })}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono-label text-xs font-bold transition-colors",
                draft.unit === unit
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {unit}
            </button>
          ))}
        </div>
      )}

      {draft.goalKind === "duration" && (
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...draft, target: m })}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono-label text-xs font-bold transition-colors",
                draft.target === m
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {m} min
            </button>
          ))}
        </div>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-lg font-semibold"
        disabled={loading || disabled || !draft.name.trim()}
      >
        {submitLabel}
      </Button>
    </form>
  )
}
