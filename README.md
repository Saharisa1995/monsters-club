# Monsters' Club Pro

A **75-day group habit challenge** app with Me+-inspired UI, deep per-habit tracking, and Supabase backend.

## Features

- **5 preset habits** with dedicated trackers: Workout, Drink water (cup-by-cup), Reading, Journal (private), Deep work (focus timer)
- **Custom habits** with count or duration goals
- **Fixed group challenge** — admin sets start date; 75-day grid + leaderboard
- **PWA** — install on iPhone/Android from the home screen
- **Group accountability** — leaderboard, people list, admin member removal

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run [`schema.sql`](schema.sql) in SQL Editor (new projects)
3. **Required for Pro features:** Run [`schema-migration-v2.sql`](schema-migration-v2.sql) in SQL Editor  
   - Adds `challenge_settings`, habit goal columns, `journal_entries`, etc.  
   - If you see `404` on `challenge_settings` or `400` on `habits` — you skipped this step.
4. Copy **Project URL** and **anon key** from Project Settings → API

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` with your real Supabase URL and anon key (not the `your-project` placeholders).

**Restart the dev server after changing `.env`** — Vite only reads env vars on startup:

```bash
npm run dev
```

### 3. Local dev

```bash
npm install
npm run dev
```

### 4. Deploy (Vercel)

**Full step-by-step guide:** see [`DEPLOY.md`](DEPLOY.md).

Quick summary:

1. Push this repo to GitHub
2. Create a Supabase project and run `schema.sql` + `schema-migration-v2.sql`
3. Import the repo at [vercel.com/new](https://vercel.com/new)
4. Set env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, optional `VITE_CHALLENGE_DAYS`
5. Deploy — Vercel uses `vercel.json` (Vite → `dist/`, SPA rewrites)
6. Add your Vercel URL in Supabase → Authentication → URL Configuration

```bash
npm run build   # verify locally before pushing
```

| Vercel | Framework: Vite · Build: `npm run build` · Output: `dist` |

## Tabs

| Tab | Purpose |
|-----|---------|
| Today | Daily habits + deep trackers |
| Challenge | 75-day grid, group scores, admin start date |
| Leaderboard | Daily vs 75-day rankings |
| People | Members, admin controls |

## Journal privacy

Journal text is stored in `journal_entries` with owner-only RLS. The group only sees whether you completed the habit.

## Promote admin

Supabase → Table Editor → `profiles` → set `is_admin` to `true`
