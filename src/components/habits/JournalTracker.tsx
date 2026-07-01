import { Check } from "lucide-react"
import type { Habit } from "@/lib/types"
import { cn } from "@/lib/utils"

type JournalTrackerProps = {
  habit: Habit
  completed: boolean
  onChange: (done: boolean) => void
}

export function JournalTracker({ completed, onChange }: JournalTrackerProps) {
  return (
    <div className="border-t border-border px-4 pb-4 pt-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        onClick={() => onChange(!completed)}
        className={cn(
          "flex w-full min-h-[52px] items-center gap-3 rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          completed
            ? "border-primary/50 bg-primary/10"
            : "border-border bg-secondary/20 hover:border-primary/30",
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            completed ? "border-primary bg-primary text-white" : "border-muted-foreground/40 bg-muted",
          )}
        >
          {completed && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {completed ? "Journal done for today" : "Mark journal complete"}
          </p>
          <p className="font-mono-label text-[11px] text-muted-foreground">
            Tap to check off · 1 pt when done
          </p>
        </div>
      </button>
    </div>
  )
}
