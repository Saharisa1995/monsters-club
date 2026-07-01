import type { GoalMode, Habit } from "./types"

export type CustomGoalKind = "count" | "duration"

export type CustomHabitDraft = {
  name: string
  goalKind: CustomGoalKind
  target: number
  unit: string
}

export const COUNT_UNIT_PRESETS = ["times", "reps", "pages", "glasses", "steps"] as const

export function goalKindToMode(kind: CustomGoalKind): GoalMode {
  return kind === "duration" ? "duration" : "count"
}

export function modeToGoalKind(mode: GoalMode): CustomGoalKind {
  return mode === "duration" ? "duration" : "count"
}

export function isCustomHabit(habit: Habit): boolean {
  return habit.habit_type === "custom"
}

export function customHabitIcon(kind: CustomGoalKind): string {
  return kind === "duration" ? "timer" : "target"
}

export function defaultUnitForKind(kind: CustomGoalKind): string {
  return kind === "duration" ? "min" : "times"
}

export function draftFromHabit(habit: Habit): CustomHabitDraft {
  const goalKind = modeToGoalKind(habit.goal_mode)
  return {
    name: habit.name,
    goalKind,
    target: habit.goal_target,
    unit: goalKind === "duration" ? "min" : habit.goal_unit || "times",
  }
}

export function emptyCustomDraft(): CustomHabitDraft {
  return {
    name: "",
    goalKind: "count",
    target: 10,
    unit: "times",
  }
}

export function normalizeCustomDraft(draft: CustomHabitDraft): CustomHabitDraft {
  const goalKind = draft.goalKind
  const target = Math.max(1, Math.round(Number(draft.target) || 1))
  const unit =
    goalKind === "duration"
      ? "min"
      : (draft.unit.trim() || "times").toLowerCase()
  return {
    name: draft.name.trim(),
    goalKind,
    target,
    unit,
  }
}

export function validateCustomDraft(draft: CustomHabitDraft): string | null {
  const normalized = normalizeCustomDraft(draft)
  if (!normalized.name) return "Enter a habit name"
  if (normalized.name.length > 48) return "Name is too long (max 48 characters)"
  if (normalized.target < 1) return "Target must be at least 1"
  if (normalized.target > 9999) return "Target is too large"
  if (normalized.goalKind === "count" && !normalized.unit) return "Enter a unit for count habits"
  return null
}

export function customDraftToPayload(draft: CustomHabitDraft) {
  const n = normalizeCustomDraft(draft)
  const goal_mode = goalKindToMode(n.goalKind)
  return {
    name: n.name,
    icon: customHabitIcon(n.goalKind),
    habit_type: "custom" as const,
    goal_mode,
    goal_target: n.target,
    goal_unit: n.unit,
  }
}

export function formatCustomGoalLabel(draft: Pick<CustomHabitDraft, "goalKind" | "target" | "unit">): string {
  const n = normalizeCustomDraft({ name: "x", ...draft })
  if (n.goalKind === "duration") return `${n.target} min per day`
  return `${n.target} ${n.unit} per day`
}
