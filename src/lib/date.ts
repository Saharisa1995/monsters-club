import { CHALLENGE_DAYS } from "./supabase"
import type { ChallengeSettings } from "./types"

export function todayISO(): string {
  const d = new Date()
  return formatISO(d)
}

export function formatISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

export function dayLetter(d: Date): string {
  return ["S", "M", "T", "W", "T", "F", "S"][d.getDay()]
}

export function weekDaysAround(centerISO: string): Date[] {
  const center = parseISO(centerISO)
  const dow = center.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(center)
  monday.setDate(monday.getDate() + mondayOffset)
  const arr: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    arr.push(d)
  }
  return arr
}

export function challengeWindow(settings: ChallengeSettings | null): {
  start: string
  end: string
  days: string[]
  dayIndex: number
  daysRemaining: number
} {
  const start = settings?.start_date ?? todayISO()
  const duration = settings?.duration_days ?? CHALLENGE_DAYS
  const startDate = parseISO(start)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + duration - 1)

  const days: string[] = []
  for (let i = 0; i < duration; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    days.push(formatISO(d))
  }

  const today = todayISO()
  const todayDate = parseISO(today)
  let dayIndex = 0
  if (todayDate >= startDate) {
    dayIndex = Math.min(
      duration,
      Math.floor((todayDate.getTime() - startDate.getTime()) / 86400000) + 1,
    )
  }

  const endISO = formatISO(endDate)
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - todayDate.getTime()) / 86400000))

  return { start, end: endISO, days, dayIndex, daysRemaining }
}

export function isInChallengeDay(iso: string, settings: ChallengeSettings | null): boolean {
  const { days } = challengeWindow(settings)
  return days.includes(iso) && iso <= todayISO()
}
