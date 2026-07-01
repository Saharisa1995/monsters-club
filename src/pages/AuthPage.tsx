import { useState } from "react"
import { Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard, MobileScreen } from "@/components/layout/MobileScreen"
import { SegmentedControl } from "@/components/layout/SegmentedControl"
import { supabase, supabaseConfigError } from "@/lib/supabase"
import { createProfile } from "@/lib/api"
import { CHALLENGE_HABIT_COUNT } from "@/lib/scoring"
import { toast } from "sonner"

const inputClass =
  "mt-1.5 h-12 rounded-lg border-border bg-input-background px-4 text-base"

type AuthPageProps = {
  onAuthed: () => void
}

export function AuthPage({ onAuthed }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!email || !password) {
      toast.error("Enter email and password")
      return
    }
    setLoading(true)
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success("Account created — you can sign in now")
      }
      onAuthed()
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Auth failed"
      if (msg === "Failed to fetch" && supabaseConfigError) {
        toast.error(supabaseConfigError)
      } else if (msg === "Failed to fetch") {
        toast.error("Can't reach Supabase. Check your internet or .env credentials.")
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileScreen className="justify-center">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-primary shadow-[0_0_24px_rgba(255,107,53,0.35)]">
          <Flame className="h-9 w-9 text-white" aria-hidden="true" />
        </div>
        <h1 className="font-display text-[32px] font-black tracking-wide uppercase">
          Monster Club
        </h1>
        <p className="mt-1.5 font-mono-label text-[10px] tracking-widest text-muted-foreground uppercase">
          Discipline Today · Freedom Tomorrow
        </p>
        <p className="mt-2 text-sm text-muted-foreground">75-day group habit challenge</p>
      </div>

      <AuthCard className="space-y-5 border-border bg-card">
        {supabaseConfigError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-center text-xs font-medium leading-relaxed text-destructive">
            {supabaseConfigError}
          </p>
        )}
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { value: "signin", label: "Sign in" },
            { value: "signup", label: "Create account" },
          ]}
        />

        <div className="space-y-4">
          <div>
            <Label className="font-mono-label text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Email
            </Label>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <Label className="font-mono-label text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Password
            </Label>
            <Input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={inputClass}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
        </div>

        <Button
          type="button"
          className="h-12 w-full rounded-lg font-display text-lg font-black uppercase"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </AuthCard>
    </MobileScreen>
  )
}

export function OnboardingPage({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("")
  const [colorIdx, setColorIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const colors = ["#ff6b35", "#818cf8", "#22c55e", "#f59e0b", "#e53935", "#c084fc"]

  async function submit() {
    if (!name.trim()) {
      toast.error("Enter your name")
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not signed in")
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true })
      const isFirst = (count ?? 0) === 0
      await createProfile(user.id, name.trim(), colors[colorIdx], isFirst)
      toast.success(isFirst ? "You're the founding admin!" : "Welcome to Monster Club!")
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileScreen className="justify-center">
      <div className="mb-6 text-center">
        <h1 className="font-display text-[28px] font-black tracking-wide uppercase">
          Join the Club
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your profile + {CHALLENGE_HABIT_COUNT} daily habits will be set up
        </p>
      </div>

      <AuthCard className="space-y-5 border-border bg-card">
        <div>
          <Label className="font-mono-label text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Your name
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jamie"
            autoComplete="name"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <div>
          <Label className="font-mono-label text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Pick a color
          </Label>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {colors.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => setColorIdx(i)}
                aria-label={`Color ${i + 1}`}
                className={`h-11 w-11 rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  colorIdx === i ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-card" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <p className="rounded-lg bg-muted/80 px-3 py-2.5 text-center font-mono-label text-[10px] leading-relaxed text-muted-foreground">
          Read · Journal · Deep work · Water · Meditation · Workout · Cold shower — 1 pt each at full goal
        </p>

        <Button
          type="button"
          className="h-12 w-full rounded-lg font-display text-lg font-black uppercase"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Setting up…" : "Enter Monster Club"}
        </Button>
      </AuthCard>
    </MobileScreen>
  )
}
