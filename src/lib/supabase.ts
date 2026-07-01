import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ""
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ""

const PLACEHOLDER_URL = "your-project.supabase.co"
const PLACEHOLDER_KEY = "your-anon-key"

export const supabaseConfigError =
  !url || !key
    ? "Missing Supabase config. Locally: copy .env.example to .env. On Vercel: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy."
    : url.includes(PLACEHOLDER_URL) || key === PLACEHOLDER_KEY
      ? "Supabase still uses placeholder values. Add your real project URL and anon key (local .env or Vercel env vars), then restart or redeploy."
      : null

if (supabaseConfigError) {
  console.error(`[Monsters' Club] ${supabaseConfigError}`)
}

export const supabase = createClient(url, key)

export const CHALLENGE_DAYS = Number(import.meta.env.VITE_CHALLENGE_DAYS ?? 75)
