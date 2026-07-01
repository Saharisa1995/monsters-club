import type { GoalMode, Habit, HabitType } from "./types"

export type TrackerKind =
  | "reading"
  | "journal"
  | "deep_work"
  | "water"
  | "meditation"
  | "workout"
  | "custom_count"
  | "custom_duration"

export type GoalVariant = {
  id: string
  label: string
  goal_mode: GoalMode
  goal_target: number
  goal_unit: string
}

export type HabitTemplate = {
  id: string
  name: string
  icon: string
  habit_type: HabitType
  description: string
  goalVariants: GoalVariant[]
  defaultVariantId: string
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: "reading",
    name: "Read book",
    icon: "book-open",
    habit_type: "reading",
    description: "Track pages or reading time",
    defaultVariantId: "reading-pages",
    goalVariants: [
      { id: "reading-pages", label: "By pages", goal_mode: "count", goal_target: 20, goal_unit: "pages" },
      { id: "reading-minutes", label: "By minutes", goal_mode: "duration", goal_target: 30, goal_unit: "min" },
    ],
  },
  {
    id: "journal",
    name: "Keep journal",
    icon: "notebook-pen",
    habit_type: "journal",
    description: "Daily reflection entry",
    defaultVariantId: "journal-entry",
    goalVariants: [
      { id: "journal-entry", label: "Daily entry", goal_mode: "binary", goal_target: 1, goal_unit: "entry" },
    ],
  },
  {
    id: "deep_work",
    name: "Deep work",
    icon: "brain",
    habit_type: "deep_work",
    description: "Focused work blocks",
    defaultVariantId: "deep-work-min",
    goalVariants: [
      { id: "deep-work-min", label: "By minutes", goal_mode: "duration", goal_target: 90, goal_unit: "min" },
      { id: "deep-work-sessions", label: "By sessions", goal_mode: "count", goal_target: 2, goal_unit: "sessions" },
    ],
  },
  {
    id: "water",
    name: "Drink water",
    icon: "droplets",
    habit_type: "water",
    description: "Stay hydrated",
    defaultVariantId: "water-cups",
    goalVariants: [
      { id: "water-cups", label: "By cups", goal_mode: "count", goal_target: 8, goal_unit: "cups" },
      { id: "water-ml", label: "By ml", goal_mode: "count", goal_target: 2000, goal_unit: "ml" },
    ],
  },
  {
    id: "meditation",
    name: "Meditation",
    icon: "wind",
    habit_type: "meditation",
    description: "Mindfulness or breathing",
    defaultVariantId: "meditation-min",
    goalVariants: [
      { id: "meditation-min", label: "By minutes", goal_mode: "duration", goal_target: 10, goal_unit: "min" },
      { id: "meditation-sessions", label: "By sessions", goal_mode: "count", goal_target: 2, goal_unit: "sessions" },
    ],
  },
  {
    id: "workout",
    name: "Workout",
    icon: "dumbbell",
    habit_type: "workout",
    description: "Move your body",
    defaultVariantId: "workout-min",
    goalVariants: [
      { id: "workout-min", label: "By minutes", goal_mode: "duration", goal_target: 45, goal_unit: "min" },
      { id: "workout-session", label: "By session", goal_mode: "count", goal_target: 1, goal_unit: "session" },
    ],
  },
  {
    id: "cold_shower",
    name: "Cold shower",
    icon: "shower-head",
    habit_type: "cold_shower",
    description: "Daily cold exposure",
    defaultVariantId: "cold-shower-done",
    goalVariants: [
      { id: "cold-shower-done", label: "Daily shower", goal_mode: "binary", goal_target: 1, goal_unit: "shower" },
    ],
  },
]

/** Map legacy Figma habit types to pro template types. */
export function canonicalHabitType(habitType: HabitType): HabitType {
  const map: Partial<Record<HabitType, HabitType>> = {
    water_gallon: "water",
    workout_indoor: "workout",
    workout_outdoor: "workout",
  }
  return map[habitType] ?? habitType
}

export function getTemplateForHabit(habit: Habit): HabitTemplate | undefined {
  const type = canonicalHabitType(habit.habit_type)
  return HABIT_TEMPLATES.find((t) => t.habit_type === type)
}

export function isTemplateAlreadyAdded(habits: Habit[], template: HabitTemplate): boolean {
  return habits.some((h) => canonicalHabitType(h.habit_type) === template.habit_type)
}

export function displayHabitName(habit: Habit): string {
  return getTemplateForHabit(habit)?.name ?? habit.name
}

export function habitVariantKey(habit: Pick<Habit, "habit_type" | "goal_mode" | "goal_unit">): string {
  return `${habit.habit_type}:${habit.goal_mode}:${habit.goal_unit}`
}

export function getVariantForHabit(habit: Habit): GoalVariant | undefined {
  const template = getTemplateForHabit(habit)
  if (!template) return undefined
  return template.goalVariants.find(
    (v) => v.goal_mode === habit.goal_mode && v.goal_unit === habit.goal_unit,
  )
}

export function formatGoalSummary(habit: Habit): string {
  if (habit.goal_mode === "binary") return "1 entry"
  return `${habit.goal_target} ${habit.goal_unit}`
}

export function resolveTracker(habit: Habit): TrackerKind {
  const { habit_type, goal_mode } = habit

  if (habit_type === "reading") return "reading"
  if (habit_type === "journal") return "journal"
  if (habit_type === "water" || habit_type === "water_gallon") return "water"
  if (habit_type === "meditation") {
    return goal_mode === "count" ? "custom_count" : "meditation"
  }
  if (habit_type === "deep_work") {
    return goal_mode === "count" ? "custom_count" : "deep_work"
  }
  if (habit_type === "workout" || habit_type === "workout_indoor" || habit_type === "workout_outdoor") {
    return goal_mode === "count" ? "custom_count" : "workout"
  }
  if (habit_type === "custom") {
    return goal_mode === "duration" ? "custom_duration" : "custom_count"
  }
  if (goal_mode === "duration") return "custom_duration"
  if (goal_mode === "count") return "custom_count"
  return "custom_count"
}

/** Default onboarding habits — one default variant per template */
export function defaultOnboardingHabits(): Omit<Habit, "id" | "owner_id" | "created_at">[] {
  return HABIT_TEMPLATES.map((template, i) => {
    const variant =
      template.goalVariants.find((v) => v.id === template.defaultVariantId) ??
      template.goalVariants[0]
    return {
      name: template.name,
      icon: template.icon,
      color_idx: i % 8,
      freq: "daily",
      habit_type: template.habit_type,
      goal_mode: variant.goal_mode,
      goal_target: variant.goal_target,
      goal_unit: variant.goal_unit,
      sort_order: i,
      is_preset: true,
    }
  })
}
