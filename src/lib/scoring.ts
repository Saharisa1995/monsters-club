import type { ChallengeSettings, Habit, HabitLog, Profile } from "./types"
import { challengeWindow, formatISO, isInChallengeDay, parseISO, todayISO } from "./date"

export function logsForHabit(
  logsByHabit: Record<string, Record<string, HabitLog>>,
  habitId: string,
): Record<string, HabitLog> {
  return logsByHabit[habitId] ?? {}
}

export function habitsForPerson(
  habitsByOwner: Record<string, Habit[]>,
  personId: string,
): Habit[] {
  return (habitsByOwner[personId] ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
}

export function isHabitEligibleOnDay(habit: Habit, iso: string): boolean {
  const created = formatISO(parseISO(habit.created_at.slice(0, 10)))
  return iso >= created
}

export function isLogComplete(habit: Habit, log?: HabitLog): boolean {
  if (!log) return false
  if (habit.goal_mode === "binary") return log.completed || log.value >= 1
  return log.completed || log.value >= habit.goal_target
}

export function completionPctForPerson(
  person: Profile,
  dateISO: string,
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const habits = habitsForPerson(habitsByOwner, person.id).filter((h) =>
    isHabitEligibleOnDay(h, dateISO),
  )
  if (habits.length === 0) return 0
  const done = habits.filter((h) =>
    isLogComplete(h, logsForHabit(logsByHabit, h.id)[dateISO]),
  ).length
  return Math.round((done / habits.length) * 100)
}

export function scoreForPersonOverDays(
  person: Profile,
  dayISOs: string[],
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const habits = habitsForPerson(habitsByOwner, person.id)
  let total = 0
  let possible = 0
  for (const iso of dayISOs) {
    if (iso > todayISO()) continue
    for (const h of habits) {
      if (!isHabitEligibleOnDay(h, iso)) continue
      possible++
      if (isLogComplete(h, logsForHabit(logsByHabit, h.id)[iso])) total++
    }
  }
  if (possible === 0) return 0
  return Math.round((total / possible) * 100)
}

export function challengeScoreForPerson(
  person: Profile,
  settings: ChallengeSettings | null,
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const { days } = challengeWindow(settings)
  const eligibleDays = days.filter((d) => isInChallengeDay(d, settings))
  return scoreForPersonOverDays(person, eligibleDays, habitsByOwner, logsByHabit)
}

export function dayMeetsThreshold(
  person: Profile,
  iso: string,
  threshold: number,
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): boolean {
  return completionPctForPerson(person, iso, habitsByOwner, logsByHabit) >= threshold
}

export function streakForHabit(
  habit: Habit,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const log = logsForHabit(logsByHabit, habit.id)
  let streak = 0
  const cursor = new Date()
  const todayStr = todayISO()
  if (!isLogComplete(habit, log[todayStr])) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (true) {
    const ci = formatISO(cursor)
    if (ci < habit.created_at.slice(0, 10)) break
    if (isLogComplete(habit, log[ci])) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else break
  }
  return streak
}

export function progressPct(habit: Habit, value: number): number {
  if (habit.goal_mode === "binary") return value >= 1 ? 100 : 0
  if (habit.goal_target <= 0) return 0
  return Math.min(100, Math.round((value / habit.goal_target) * 100))
}
