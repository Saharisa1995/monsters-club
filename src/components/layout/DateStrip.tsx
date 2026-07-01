import { dayLetter, formatISO, weekDaysAround } from "@/lib/date"
import { cn } from "@/lib/utils"
import { todayISO } from "@/lib/date"

type DateStripProps = {
  selected: string
  onSelect: (iso: string) => void
  hasProgress?: (iso: string) => boolean
}

export function DateStrip({ selected, onSelect, hasProgress }: DateStripProps) {
  const days = weekDaysAround(selected)
  const today = todayISO()

  return (
    <div className="flex justify-between gap-1 px-5 pb-2">
      {days.map((d) => {
        const iso = formatISO(d)
        const isSelected = iso === selected
        const isFuture = iso > today
        const progress = hasProgress?.(iso)

        return (
          <button
            key={iso}
            type="button"
            disabled={isFuture}
            onClick={() => onSelect(iso)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-2 transition-all",
              isSelected && "bg-primary text-primary-foreground shadow-sm",
              !isSelected && !isFuture && "text-muted-foreground",
              isFuture && "opacity-40",
            )}
          >
            <span className="text-[11px] font-semibold">{dayLetter(d)}</span>
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                isSelected && "bg-white/25",
                !isSelected && progress && "ring-2 ring-primary/30 ring-offset-1",
                !isSelected && !progress && "bg-muted",
              )}
            >
              {d.getDate()}
            </span>
          </button>
        )
      })}
    </div>
  )
}
