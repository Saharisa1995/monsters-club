import { cn } from "@/lib/utils"

type SegmentedControlProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "flex rounded-2xl bg-muted p-1",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-bold transition-all",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
