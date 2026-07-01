import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ""
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? ""

const PLACEHOLDER_URL = "your-project.supabase.co"
const PLACEHOLDER_KEY = "your-anon-key"

export const supabaseConfigError =
  !url || !key
    ? "Missing Supabase config. Copy .env.example to .env and add your project URL + anon key."
    : url.includes(PLACEHOLDER_URL) || key === PLACEHOLDER_KEY
      ? "Supabase still uses placeholder values in .env. Add your real URL and anon key, then restart npm run dev."
      : null

if (supabaseConfigError) {
  console.error(`[Monsters' Club] ${supabaseConfigError}`)
}

export const supabase = createClient(url, key)

export const CHALLENGE_DAYS = Number(import.meta.env.VITE_CHALLENGE_DAYS ?? 75)
