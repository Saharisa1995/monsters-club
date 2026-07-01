import {
  BarChart3,
  Home,
  Image,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react"
import { LockedNavItem } from "@/components/monster/LockedNavItem"
import { isFeatureEnabled } from "@/lib/featureFlags"
import type { TabId } from "@/lib/types"
import { cn } from "@/lib/utils"

const TABS: { id: TabId; label: string; icon: LucideIcon; locked?: boolean }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "club", label: "Club", icon: Users },
  { id: "feed", label: "Feed", icon: Image, locked: true },
  { id: "leaderboard", label: "Ranks", icon: Trophy },
]

type BottomNavProps = {
  active: TabId
  onChange: (tab: TabId) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-border px-2 py-2 backdrop-blur-md"
      style={{ background: "rgba(7,8,15,0.95)" }}
    >
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ id, label, icon: Icon, locked }) => {
          const isLocked = locked && !isFeatureEnabled("feed") && id === "feed"
          if (isLocked) {
            return (
              <LockedNavItem
                key={id}
                icon={Icon}
                label={label}
                active={active === id}
                onClick={() => onChange(id)}
              />
            )
          }
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                active === id ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active === id && "scale-110")} />
              <span className="font-mono-label text-[10px] font-medium">{label}</span>
              {active === id && (
                <div className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
