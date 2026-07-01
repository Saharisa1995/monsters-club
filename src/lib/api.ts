import type { PostgrestError } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { PRESET_HABITS } from "./types"
import type { ChallengeSettings, GoalMode, Habit, HabitLog, HabitType, JournalEntry, Profile } from "./types"
import { defaultOnboardingHabits } from "./habitTemplates"

export type AppData = {
  people: Profile[]
  habitsByOwner: Record<string, Habit[]>
  logsByHabit: Record<string, Record<string, HabitLog>>
  challenge: ChallengeSettings | null
  schemaV2: boolean
}

export const SCHEMA_MIGRATION_HINT =
  "Run schema-migration-v2.sql in Supabase → SQL Editor (see README). The app needs the v2 tables/columns."

function isMissingRelation(err: PostgrestError | null, name: string): boolean {
  if (!err) return false
  return (
    err.code === "PGRST205" ||
    err.code === "42P01" ||
    err.message.includes(name) ||
    err.message.includes("does not exist")
  )
}

function isMissingColumn(err: PostgrestError | null): boolean {
  if (!err) return false
  return err.code === "42703" || err.message.includes("column")
}

export function normalizeHabit(row: Record<string, unknown>): Habit {
  const presetByName = PRESET_HABITS.find((p) => p.name === row.name)
  return {
    id: row.id as string,
    owner_id: row.owner_id as string,
    name: row.name as string,
    icon: (row.icon as string) ?? "target",
    color_idx: Number(row.color_idx ?? 0),
    freq: (row.freq as string) ?? "daily",
    habit_type: (row.habit_type as Habit["habit_type"]) ?? presetByName?.habit_type ?? "custom",
    goal_mode: (row.goal_mode as Habit["goal_mode"]) ?? presetByName?.goal_mode ?? "binary",
    goal_target: Number(row.goal_target ?? presetByName?.goal_target ?? 1),
    goal_unit: (row.goal_unit as string) ?? presetByName?.goal_unit ?? "",
    sort_order: Number(row.sort_order ?? presetByName?.sort_order ?? 0),
    is_preset: Boolean(row.is_preset ?? !!presetByName),
    created_at: row.created_at as string,
  }
}

export function normalizeLog(row: Record<string, unknown>): HabitLog {
  const hasValue = row.value != null
  const value = hasValue ? Number(row.value) : 1
  const completed = row.completed != null ? Boolean(row.completed) : true
  return {
    id: row.id as string,
    habit_id: row.habit_id as string,
    owner_id: row.owner_id as string,
    log_date: row.log_date as string,
    value,
    completed,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  }
}

async function fetchHabits(): Promise<{ data: Habit[]; schemaV2: boolean }> {
  const v2 = await supabase.from("habits").select("*").order("sort_order", { ascending: true })
  if (!v2.error) {
    return { data: (v2.data ?? []).map((r) => normalizeHabit(r)), schemaV2: true }
  }
  if (!isMissingColumn(v2.error)) throw v2.error

  const v1 = await supabase.from("habits").select("*").order("created_at", { ascending: true })
  if (v1.error) throw v1.error
  return { data: (v1.data ?? []).map((r) => normalizeHabit(r)), schemaV2: false }
}

async function fetchChallenge(): Promise<ChallengeSettings | null> {
  const res = await supabase.from("challenge_settings").select("*").eq("id", 1).maybeSingle()
  if (!res.error) return (res.data as ChallengeSettings | null) ?? null
  if (isMissingRelation(res.error, "challenge_settings")) return null
  if (res.error.code === "PGRST116") return null
  throw res.error
}

export async function fetchAllData(_userId: string): Promise<AppData> {
  const [profilesRes, habitsResult, logsRes, challenge] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    fetchHabits(),
    supabase.from("habit_logs").select("*"),
    fetchChallenge(),
  ])

  if (profilesRes.error) throw profilesRes.error
  if (logsRes.error) throw logsRes.error

  const habitsByOwner: Record<string, Habit[]> = {}
  for (const h of habitsResult.data) {
    if (!habitsByOwner[h.owner_id]) habitsByOwner[h.owner_id] = []
    habitsByOwner[h.owner_id].push(h)
  }

  const logsByHabit: Record<string, Record<string, HabitLog>> = {}
  for (const l of (logsRes.data ?? []).map((r) => normalizeLog(r))) {
    if (!logsByHabit[l.habit_id]) logsByHabit[l.habit_id] = {}
    logsByHabit[l.habit_id][l.log_date] = l
  }

  return {
    people: (profilesRes.data ?? []) as Profile[],
    habitsByOwner,
    logsByHabit,
    challenge,
    schemaV2: habitsResult.schemaV2,
  }
}

export async function createProfile(
  userId: string,
  name: string,
  color: string,
  isAdmin: boolean,
): Promise<void> {
  const { error } = await supabase.from("profiles").insert({
    id: userId,
    name,
    color,
    is_admin: isAdmin,
  })
  if (error) throw error

  const v2Rows = defaultOnboardingHabits().map((h, i) => ({
    owner_id: userId,
    ...h,
    sort_order: i,
  }))
  const v2 = await supabase.from("habits").insert(v2Rows)
  if (!v2.error) return

  if (!isMissingColumn(v2.error)) throw v2.error

  const v1Rows = defaultOnboardingHabits().map((h) => ({
    owner_id: userId,
    name: h.name,
    icon: h.icon,
    color_idx: h.color_idx,
    freq: h.freq,
  }))
  const v1 = await supabase.from("habits").insert(v1Rows)
  if (v1.error) throw v1.error
}

export async function upsertHabitLog(
  habit: Habit,
  userId: string,
  logDate: string,
  value: number,
  completed: boolean,
  metadata: Record<string, unknown> = {},
): Promise<HabitLog> {
  const existing = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habit.id)
    .eq("log_date", logDate)
    .maybeSingle()

  if (existing.error) throw existing.error

  const v2Payload = {
    habit_id: habit.id,
    owner_id: userId,
    log_date: logDate,
    value,
    completed,
    metadata,
  }

  if (existing.data) {
    const upd = await supabase.from("habit_logs").update(v2Payload).eq("id", existing.data.id).select().single()
    if (!upd.error) return normalizeLog(upd.data)
    if (!isMissingColumn(upd.error)) throw upd.error
  } else {
    const ins = await supabase.from("habit_logs").insert(v2Payload).select().single()
    if (!ins.error) return normalizeLog(ins.data)
    if (!isMissingColumn(ins.error)) throw ins.error
  }

  const v1Payload = { habit_id: habit.id, owner_id: userId, log_date: logDate }
  if (existing.data) {
    const { data, error } = await supabase
      .from("habit_logs")
      .update(v1Payload)
      .eq("id", existing.data.id)
      .select()
      .single()
    if (error) throw error
    return normalizeLog({ ...data, value, completed })
  }
  const { data, error } = await supabase.from("habit_logs").insert(v1Payload).select().single()
  if (error) throw error
  return normalizeLog({ ...data, value, completed })
}

export async function deleteHabitLog(habitId: string, logDate: string): Promise<void> {
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("log_date", logDate)
  if (error) throw error
}

export async function fetchJournalEntry(
  habitId: string,
  logDate: string,
): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("habit_id", habitId)
    .eq("log_date", logDate)
    .maybeSingle()
  if (error) {
    if (isMissingRelation(error, "journal_entries")) return null
    throw error
  }
  return (data as JournalEntry) ?? null
}

export async function upsertJournalEntry(
  habitId: string,
  userId: string,
  logDate: string,
  content: string,
  mood: number | null,
): Promise<void> {
  const { error } = await supabase.from("journal_entries").upsert(
    {
      habit_id: habitId,
      owner_id: userId,
      log_date: logDate,
      content,
      mood,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "habit_id,log_date" },
  )
  if (error) {
    if (isMissingRelation(error, "journal_entries")) {
      throw new Error(SCHEMA_MIGRATION_HINT)
    }
    throw error
  }
}

export async function createHabit(
  userId: string,
  payload: {
    name: string
    icon?: string
    color_idx?: number
    habit_type?: HabitType
    goal_mode?: GoalMode
    goal_target?: number
    goal_unit?: string
    sort_order?: number
  },
): Promise<Habit> {
  const row = {
    owner_id: userId,
    name: payload.name.trim(),
    icon: payload.icon ?? "target",
    color_idx: payload.color_idx ?? 0,
    freq: "daily",
    habit_type: payload.habit_type ?? "custom",
    goal_mode: payload.goal_mode ?? "binary",
    goal_target: payload.goal_target ?? 1,
    goal_unit: payload.goal_unit ?? "pt",
    sort_order: payload.sort_order ?? 99,
    is_preset: false,
  }
  const { data, error } = await supabase.from("habits").insert(row).select().single()
  if (error) {
    if (isMissingColumn(error)) {
      const v1 = await supabase
        .from("habits")
        .insert({
          owner_id: userId,
          name: payload.name,
          icon: payload.icon ?? "target",
          color_idx: 0,
          freq: "daily",
        })
        .select()
        .single()
      if (v1.error) throw v1.error
      return normalizeHabit(v1.data)
    }
    throw error
  }
  return normalizeHabit(data)
}

export async function updateHabit(
  habitId: string,
  updates: Partial<
    Pick<Habit, "name" | "icon" | "sort_order" | "goal_mode" | "goal_target" | "goal_unit">
  >,
): Promise<void> {
  const { error } = await supabase.from("habits").update(updates).eq("id", habitId)
  if (error) throw error
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { error } = await supabase.from("habits").delete().eq("id", habitId)
  if (error) throw error
}

export async function updateChallengeStart(
  startDate: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from("challenge_settings").upsert({
    id: 1,
    start_date: startDate,
    duration_days: 75,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  })
  if (error) {
    if (isMissingRelation(error, "challenge_settings")) {
      throw new Error(SCHEMA_MIGRATION_HINT)
    }
    throw error
  }
}
