export type HabitType =
  | "workout"
  | "water"
  | "reading"
  | "journal"
  | "deep_work"
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

export type TabId = "today" | "challenge" | "leaderboard" | "people"

export type WorkoutMetadata = {
  activity?: string
  note?: string
}

export type DeepWorkMetadata = {
  sessions?: { minutes: number; at: string }[]
}

export const PRESET_HABITS: Omit<
  Habit,
  "id" | "owner_id" | "created_at"
>[] = [
  {
    name: "Workout",
    icon: "dumbbell",
    color_idx: 3,
    freq: "daily",
    habit_type: "workout",
    goal_mode: "duration",
    goal_target: 30,
    goal_unit: "min",
    sort_order: 0,
    is_preset: true,
  },
  {
    name: "Drink water",
    icon: "droplet",
    color_idx: 2,
    freq: "daily",
    habit_type: "water",
    goal_mode: "count",
    goal_target: 8,
    goal_unit: "cups",
    sort_order: 1,
    is_preset: true,
  },
  {
    name: "Reading",
    icon: "book-open",
    color_idx: 1,
    freq: "daily",
    habit_type: "reading",
    goal_mode: "count",
    goal_target: 20,
    goal_unit: "pages",
    sort_order: 2,
    is_preset: true,
  },
  {
    name: "Journal",
    icon: "notebook-pen",
    color_idx: 4,
    freq: "daily",
    habit_type: "journal",
    goal_mode: "binary",
    goal_target: 1,
    goal_unit: "entry",
    sort_order: 3,
    is_preset: true,
  },
  {
    name: "Deep work",
    icon: "brain",
    color_idx: 0,
    freq: "daily",
    habit_type: "deep_work",
    goal_mode: "duration",
    goal_target: 90,
    goal_unit: "min",
    sort_order: 4,
    is_preset: true,
  },
]

export const HABIT_TYPE_COLORS: Record<HabitType, string> = {
  water: "bg-habit-water",
  workout: "bg-habit-workout",
  reading: "bg-habit-reading",
  journal: "bg-habit-journal",
  deep_work: "bg-habit-deep-work",
  custom: "bg-habit-custom",
}
