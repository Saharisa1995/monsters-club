import type { ChallengeSettings, Habit, HabitLog, Profile } from "./types"
import { challengeWindow, formatISO, isInChallengeDay, parseISO, todayISO } from "./date"

/** Every member needs exactly this many habits for fair scoring and ranks. */
export const CHALLENGE_HABIT_COUNT = 7

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

export function scoringHabitsForPerson(
  habitsByOwner: Record<string, Habit[]>,
  personId: string,
): Habit[] {
  return habitsForPerson(habitsByOwner, personId).slice(0, CHALLENGE_HABIT_COUNT)
}

export function isScoringEligible(
  habitsByOwner: Record<string, Habit[]>,
  personId: string,
): boolean {
  return habitsForPerson(habitsByOwner, personId).length >= CHALLENGE_HABIT_COUNT
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

export function eligibleHabitsForDay(
  person: Profile,
  dateISO: string,
  habitsByOwner: Record<string, Habit[]>,
): Habit[] {
  return scoringHabitsForPerson(habitsByOwner, person.id).filter((h) =>
    isHabitEligibleOnDay(h, dateISO),
  )
}

export function dailyPoints(
  person: Profile,
  dateISO: string,
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const habits = eligibleHabitsForDay(person, dateISO, habitsByOwner)
  return habits.filter((h) =>
    isLogComplete(h, logsForHabit(logsByHabit, h.id)[dateISO]),
  ).length
}

export function maxTotalPoints(_habitCount?: number, durationDays = 75): number {
  return CHALLENGE_HABIT_COUNT * durationDays
}

export function totalPoints(
  person: Profile,
  dayISOs: string[],
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  let total = 0
  for (const iso of dayISOs) {
    if (iso > todayISO()) continue
    total += dailyPoints(person, iso, habitsByOwner, logsByHabit)
  }
  return total
}

export function perfectDays(
  person: Profile,
  dayISOs: string[],
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  let count = 0
  for (const iso of dayISOs) {
    if (iso > todayISO()) continue
    const habits = eligibleHabitsForDay(person, iso, habitsByOwner)
    if (habits.length === 0) continue
    const done = habits.filter((h) =>
      isLogComplete(h, logsForHabit(logsByHabit, h.id)[iso]),
    ).length
    if (done === habits.length) count++
  }
  return count
}

export function completionPctForPerson(
  person: Profile,
  dateISO: string,
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const habits = eligibleHabitsForDay(person, dateISO, habitsByOwner)
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
  const habits = scoringHabitsForPerson(habitsByOwner, person.id)
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

export function challengePointsForPerson(
  person: Profile,
  settings: ChallengeSettings | null,
  habitsByOwner: Record<string, Habit[]>,
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const { days } = challengeWindow(settings)
  const eligibleDays = days.filter((d) => isInChallengeDay(d, settings))
  return totalPoints(person, eligibleDays, habitsByOwner, logsByHabit)
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

export function habitCompletionRate(
  habit: Habit,
  dayISOs: string[],
  logsByHabit: Record<string, Record<string, HabitLog>>,
): number {
  const eligible = dayISOs.filter(
    (iso) => iso <= todayISO() && isHabitEligibleOnDay(habit, iso),
  )
  if (eligible.length === 0) return 0
  const done = eligible.filter((iso) =>
    isLogComplete(habit, logsForHabit(logsByHabit, habit.id)[iso]),
  ).length
  return Math.round((done / eligible.length) * 100)
}
