import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { DeepWorkMetadata, Habit } from "@/lib/types"
import { progressPct } from "@/lib/scoring"

type DeepWorkTrackerProps = {
  habit: Habit
  value: number
  metadata: DeepWorkMetadata
  onChange: (value: number, metadata: DeepWorkMetadata) => void
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function DeepWorkTracker({ habit, value, metadata, onChange }: DeepWorkTrackerProps) {
  const [running, setRunning] = useState(false)
  const [sessionSec, setSessionSec] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessions = metadata.sessions ?? []
  const pct = progressPct(habit, value)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSessionSec((s) => s + 1), 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  function endSession() {
    const mins = Math.round(sessionSec / 60)
    if (mins > 0) {
      const nextSessions = [...sessions, { minutes: mins, at: new Date().toISOString() }]
      onChange(value + mins, { sessions: nextSessions })
    }
    setSessionSec(0)
    setRunning(false)
  }

  return (
    <div className="space-y-4 border-t border-white/30 px-4 pb-4 pt-2">
      <div className="flex flex-col items-center rounded-3xl bg-gradient-to-br from-indigo-400/30 to-violet-400/30 py-6">
        <p className="text-5xl font-extrabold tabular-nums">{formatTimer(sessionSec)}</p>
        <p className="mt-1 text-sm font-semibold text-foreground/60">
          Total today: {value} / {habit.goal_target} min · {pct}%
        </p>
        <div className="mt-4 flex gap-2">
          {!running ? (
            <Button type="button" className="rounded-full px-6" onClick={() => setRunning(true)}>
              Start focus
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" className="rounded-full bg-white/50" onClick={() => setRunning(false)}>
                Pause
              </Button>
              <Button type="button" className="rounded-full" onClick={endSession}>
                End session
              </Button>
            </>
          )}
        </div>
      </div>
      {sessions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sessions.map((s, i) => (
            <span
              key={i}
              className="rounded-full bg-white/50 px-3 py-1 text-xs font-bold"
            >
              {s.minutes}m session
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
