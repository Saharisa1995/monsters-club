import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session } from "@supabase/supabase-js"
import { toast } from "sonner"
import { fetchAllData, type AppData } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import type { HabitLog, Profile, TabId } from "@/lib/types"

type AppContextValue = {
  session: Session | null
  loading: boolean
  me: Profile | null
  data: AppData | null
  tab: TabId
  setTab: (tab: TabId) => void
  selectedDay: string
  setSelectedDay: (iso: string) => void
  refresh: () => Promise<void>
  applyHabitLog: (log: HabitLog) => void
  clearHabitLog: (habitId: string, logDate: string) => void
  signOut: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AppData | null>(null)
  const [tab, setTab] = useState<TabId>("today")
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })

  const me = useMemo(
    () => data?.people.find((p) => p.id === session?.user.id) ?? null,
    [data, session],
  )

  const refresh = useCallback(async () => {
    if (!session?.user.id) return
    const next = await fetchAllData(session.user.id)
    setData(next)
  }, [session?.user.id])

  const applyHabitLog = useCallback((log: HabitLog) => {
    setData((prev) => {
      if (!prev) return prev
      const logsByHabit = { ...prev.logsByHabit }
      const byDate = { ...(logsByHabit[log.habit_id] ?? {}) }
      byDate[log.log_date] = log
      logsByHabit[log.habit_id] = byDate
      return { ...prev, logsByHabit }
    })
  }, [])

  const clearHabitLog = useCallback((habitId: string, logDate: string) => {
    setData((prev) => {
      if (!prev) return prev
      const logsByHabit = { ...prev.logsByHabit }
      const byDate = { ...(logsByHabit[habitId] ?? {}) }
      delete byDate[logDate]
      logsByHabit[habitId] = byDate
      return { ...prev, logsByHabit }
    })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user.id) {
      setData(null)
      return
    }
    refresh().catch((e) => toast.error(e.message ?? "Couldn't load data"))
  }, [session?.user.id, refresh])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setData(null)
    setTab("today")
  }, [])

  return (
    <AppContext.Provider
      value={{
        session,
        loading,
        me,
        data,
        tab,
        setTab,
        selectedDay,
        setSelectedDay,
        refresh,
        applyHabitLog,
        clearHabitLog,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
