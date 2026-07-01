import { BottomNav } from "@/components/layout/BottomNav"
import { MonsterClubHeader } from "@/components/monster/MonsterClubHeader"
import { MobileScreen } from "@/components/layout/MobileScreen"
import { SchemaGate } from "@/components/layout/SchemaBanner"
import { useApp } from "@/context/AppContext"
import { AuthPage, OnboardingPage } from "@/pages/AuthPage"
import { TodayPage } from "@/pages/TodayPage"
import { ProgressPage } from "@/pages/ProgressPage"
import { ClubPage } from "@/pages/ClubPage"
import { FeedPage } from "@/pages/FeedPage"
import { LeaderboardPage } from "@/pages/LeaderboardPage"
import { Flame } from "lucide-react"

function MainApp() {
  const { tab, setTab } = useApp()

  return (
    <MobileScreen className="px-0 pb-0 pt-0">
      <div className="app-shell flex-1">
        <MonsterClubHeader />
        <main className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SchemaGate>
            {tab === "today" && <TodayPage />}
            {tab === "progress" && <ProgressPage />}
            {tab === "club" && <ClubPage />}
            {tab === "feed" && <FeedPage />}
            {tab === "leaderboard" && <LeaderboardPage />}
          </SchemaGate>
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </MobileScreen>
  )
}

export default function App() {
  const { session, loading, me, refresh } = useApp()

  if (loading) {
    return (
      <MobileScreen className="items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Flame className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          <p className="font-mono-label text-sm text-muted-foreground">Loading Monster Club…</p>
        </div>
      </MobileScreen>
    )
  }

  if (!session) {
    return <AuthPage onAuthed={() => refresh()} />
  }

  if (!me) {
    return <OnboardingPage onDone={() => refresh()} />
  }

  return <MainApp />
}
