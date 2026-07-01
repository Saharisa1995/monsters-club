import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Habit } from "@/lib/types"
import { cn } from "@/lib/utils"

const MOODS = [
  { value: 1, emoji: "😢", label: "Low" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😄", label: "Great" },
]

type JournalTrackerProps = {
  habit: Habit
  content: string
  mood: number | null
  onChange: (content: string, mood: number | null) => void
}

export function JournalTracker({ content, mood, onChange }: JournalTrackerProps) {
  const [text, setText] = useState(content)
  const [selectedMood, setSelectedMood] = useState<number | null>(mood)

  useEffect(() => {
    setText(content)
    setSelectedMood(mood)
  }, [content, mood])

  return (
    <div className="space-y-4 border-t border-white/30 px-4 pb-4 pt-2">
      <p className="text-xs font-semibold text-foreground/50">
        Private — only you can read your journal. The group sees completion only.
      </p>
      <div>
        <Label className="text-xs font-bold uppercase text-foreground/50">How do you feel?</Label>
        <div className="mt-2 flex justify-between gap-1">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                setSelectedMood(m.value)
                onChange(text, m.value)
              }}
              className={cn(
                "flex h-12 flex-1 flex-col items-center justify-center rounded-2xl text-xl transition-all",
                selectedMood === m.value ? "bg-white shadow-md scale-105" : "bg-white/40",
              )}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-xs font-bold uppercase text-foreground/50">Today&apos;s entry</Label>
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onChange(e.target.value, selectedMood)
          }}
          placeholder="Write freely…"
          className="mt-1 min-h-[120px] resize-none rounded-2xl bg-white/60"
        />
      </div>
    </div>
  )
}
