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

### 4. Deploy (Vercel / GitHub Pages / Netlify)

```bash
npm run build
```

Deploy the `dist/` folder. Set the same env vars in your host dashboard.

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
