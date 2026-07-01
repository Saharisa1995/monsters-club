import { CheckSquare, Grid3x3, Trophy, Users } from "lucide-react"
import type { TabId } from "@/lib/types"
import { cn } from "@/lib/utils"

const TABS: { id: TabId; label: string; icon: typeof CheckSquare }[] = [
  { id: "today", label: "Today", icon: CheckSquare },
  { id: "challenge", label: "Challenge", icon: Grid3x3 },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "people", label: "People", icon: Users },
]

type BottomNavProps = {
  active: TabId
  onChange: (tab: TabId) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-[480px] border-t border-border bg-background/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="flex">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-1 text-[10.5px] font-semibold transition-colors",
              active === id ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={active === id ? 2.5 : 2} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
