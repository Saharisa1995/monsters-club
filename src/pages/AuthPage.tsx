import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard, MobileScreen } from "@/components/layout/MobileScreen"
import { SegmentedControl } from "@/components/layout/SegmentedControl"
import { supabase, supabaseConfigError } from "@/lib/supabase"
import { createProfile } from "@/lib/api"
import { toast } from "sonner"

const inputClass =
  "mt-1.5 h-12 rounded-2xl border-border/80 bg-background px-4 text-base"

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
        <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-primary text-3xl shadow-md shadow-primary/25">
          🐾
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight">Monsters&apos; Club</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          75-day group habit challenge
        </p>
      </div>

      <AuthCard className="space-y-5">
        {supabaseConfigError && (
          <p className="rounded-2xl bg-destructive/10 px-3 py-2.5 text-center text-xs font-medium leading-relaxed text-destructive">
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
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
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
            <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
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
          className="h-12 w-full rounded-2xl text-base font-bold"
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
  const colors = ["#8B6CF6", "#3FB97B", "#E8A23B", "#E5594B", "#9678EB", "#EC6FA0"]

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
      toast.success(isFirst ? "You're the founding admin!" : "Welcome!")
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
        <h1 className="text-[28px] font-extrabold tracking-tight">Almost there</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          Your profile + 5 daily habits will be set up
        </p>
      </div>

      <AuthCard className="space-y-5">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
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
          <Label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Pick a color
          </Label>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {colors.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => setColorIdx(i)}
                aria-label={`Color ${i + 1}`}
                className={`h-11 w-11 rounded-full transition-transform ${
                  colorIdx === i ? "scale-110 ring-2 ring-primary ring-offset-2" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <p className="rounded-2xl bg-muted/80 px-3 py-2.5 text-center text-xs leading-relaxed text-muted-foreground">
          Workout · Water · Reading · Journal · Deep work — added automatically
        </p>

        <Button
          type="button"
          className="h-12 w-full rounded-2xl text-base font-bold"
          disabled={loading}
          onClick={submit}
        >
          {loading ? "Setting up…" : "Continue"}
        </Button>
      </AuthCard>
    </MobileScreen>
  )
}
