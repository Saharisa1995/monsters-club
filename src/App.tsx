import { BottomNav } from "@/components/layout/BottomNav"
import { MobileScreen } from "@/components/layout/MobileScreen"
import { SchemaGate } from "@/components/layout/SchemaBanner"
import { useApp } from "@/context/AppContext"
import { AuthPage, OnboardingPage } from "@/pages/AuthPage"
import { TodayPage } from "@/pages/TodayPage"
import { ChallengePage } from "@/pages/ChallengePage"
import { LeaderboardPage } from "@/pages/LeaderboardPage"
import { PeoplePage } from "@/pages/PeoplePage"

function MainApp() {
  const { tab, setTab } = useApp()

  return (
    <MobileScreen className="px-0 pb-0 pt-0">
      <div className="app-shell flex-1">
        <main className="flex-1 pb-4">
          <SchemaGate>
            {tab === "today" && <TodayPage />}
            {tab === "challenge" && <ChallengePage />}
            {tab === "leaderboard" && <LeaderboardPage />}
            {tab === "people" && <PeoplePage />}
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground">
            🐾
          </div>
          <p className="text-sm font-medium text-muted-foreground">Loading Monsters&apos; Club…</p>
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
