export type HabitType =
  | "workout_indoor"
  | "workout_outdoor"
  | "water_gallon"
  | "diet"
  | "reading"
  | "photo"
  | "cold_shower"
  | "workout"
  | "water"
  | "journal"
  | "deep_work"
  | "meditation"
  | "custom"

export type GoalMode = "binary" | "count" | "duration"

export type Profile = {
  id: string
  name: string
  color: string
  is_admin: boolean
  created_at: string
}

export type Habit = {
  id: string
  owner_id: string
  name: string
  icon: string
  color_idx: number
  freq: string
  habit_type: HabitType
  goal_mode: GoalMode
  goal_target: number
  goal_unit: string
  sort_order: number
  is_preset: boolean
  created_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  owner_id: string
  log_date: string
  value: number
  completed: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export type JournalEntry = {
  id: string
  habit_id: string
  owner_id: string
  log_date: string
  content: string
  mood: number | null
  created_at: string
  updated_at: string
}

export type ChallengeSettings = {
  id: number
  start_date: string
  duration_days: number
  updated_at: string
  updated_by: string | null
}

export type TabId = "today" | "progress" | "club" | "feed" | "leaderboard"

export type WorkoutMetadata = {
  activity?: string
  note?: string
}

export type DeepWorkMetadata = {
  sessions?: { minutes: number; at: string }[]
}

export const HABIT_DETAILS: Partial<Record<HabitType, string>> = {
  workout_indoor: "45 min indoor workout",
  workout_outdoor: "45 min outdoor workout",
  water_gallon: "Drink 1 gallon of water",
  diet: "No alcohol, no cheat meals",
  reading: "Non-fiction book",
  photo: "Daily progress photo",
  cold_shower: "Cold shower for discipline",
}

export const PRESET_HABITS: Omit<Habit, "id" | "owner_id" | "created_at">[] = [
  {
    name: "Workout 1",
    icon: "dumbbell",
    color_idx: 3,
    freq: "daily",
    habit_type: "workout_indoor",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "pt",
    sort_order: 0,
    is_preset: true,
  },
  {
    name: "Workout 2",
    icon: "sun",
    color_idx: 4,
    freq: "daily",
    habit_type: "workout_outdoor",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "pt",
    sort_order: 1,
    is_preset: true,
  },
  {
    name: "Gallon Water",
    icon: "droplets",
    color_idx: 2,
    freq: "daily",
    habit_type: "water_gallon",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "pt",
    sort_order: 2,
    is_preset: true,
  },
  {
    name: "Clean Diet",
    icon: "salad",
    color_idx: 1,
    freq: "daily",
    habit_type: "diet",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "pt",
    sort_order: 3,
    is_preset: true,
  },
  {
    name: "Read 10 Pages",
    icon: "book-open",
    color_idx: 0,
    freq: "daily",
    habit_type: "reading",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "pt",
    sort_order: 4,
    is_preset: true,
  },
  {
    name: "Progress Photo",
    icon: "camera",
    color_idx: 5,
    freq: "daily",
    habit_type: "photo",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "pt",
    sort_order: 5,
    is_preset: true,
  },
  {
    name: "Cold Shower",
    icon: "shower-head",
    color_idx: 6,
    freq: "daily",
    habit_type: "cold_shower",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "pt",
    sort_order: 6,
    is_preset: true,
  },
]

export const HABIT_TYPE_COLORS: Record<string, string> = {
  water_gallon: "bg-card",
  workout_indoor: "bg-card",
  workout_outdoor: "bg-card",
  diet: "bg-card",
  reading: "bg-card",
  photo: "bg-card",
  cold_shower: "bg-card",
  water: "bg-card",
  workout: "bg-card",
  journal: "bg-card",
  deep_work: "bg-card",
  meditation: "bg-card",
  custom: "bg-card",
}
