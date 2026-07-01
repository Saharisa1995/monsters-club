# Deploy Monsters' Club to Vercel

This app is a **Vite + React** frontend that talks to **Supabase** (database + auth). Vercel hosts the static site; Supabase stays on [supabase.com](https://supabase.com).

---

## What you need

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (sign in with GitHub)
- A [Supabase](https://supabase.com) project (free tier is enough for ~30 users)

---

## Part 1 — Supabase (database + auth)

Do this once before deploying the frontend.

### 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Pick a name, password, and region → **Create new project**
4. Wait until the project is ready (~1–2 minutes)

### 2. Run the database schema

1. In Supabase, open **SQL Editor**
2. Click **New query**
3. Copy the full contents of [`schema.sql`](schema.sql) from this repo → paste → **Run**
4. Create another query, paste [`schema-migration-v2.sql`](schema-migration-v2.sql) → **Run**

If you skip step 4, the app will show errors for `challenge_settings` or habit goal columns.

### 3. Copy API keys

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (safe for the browser — not the `service_role` key)

Keep these handy for Part 3.

### 4. (After first deploy) Add your Vercel URL to Supabase Auth

You will do this again after Vercel gives you a URL (Part 4, step 6):

1. Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: your Vercel URL, e.g. `https://monsters-club.vercel.app`
3. **Redirect URLs**: add the same URL (and `https://your-custom-domain.com` if you add one later)
4. Save

---

## Part 2 — Push code to GitHub

If the repo is not on GitHub yet:

```bash
git init
git add .
git commit -m "Prepare Monsters' Club for Vercel deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/monsters-club.git
git push -u origin main
```

If it is already on GitHub, commit and push your latest changes:

```bash
git add .
git commit -m "Prepare for Vercel deploy"
git push
```

**Important:** Never commit `.env`. It is in `.gitignore`. Secrets go only in Vercel (and local `.env` for dev).

---

## Part 3 — Deploy on Vercel

### 1. Import the project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with **GitHub** if asked
3. Find **monsters-club** (or your repo name) → **Import**

### 2. Configure the project

Vercel should auto-detect **Vite** from `vercel.json` and `package.json`. Confirm:

| Setting | Value |
|---------|--------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` (default) |

Root directory: leave as `.` unless the app lives in a subfolder.

### 3. Add environment variables

Before clicking **Deploy**, expand **Environment Variables** and add:

| Name | Value | Environments |
|------|--------|--------------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key | Production, Preview, Development |
| `VITE_CHALLENGE_DAYS` | `75` (optional) | Production, Preview, Development |

Vite bakes these into the build at **build time**. If you change them later, you must **redeploy**.

### 4. Deploy

Click **Deploy**. Vercel will install dependencies, run `npm run build`, and publish `dist/`.

When it finishes, you get a URL like `https://monsters-club-xxxxx.vercel.app`.

### 5. Finish Supabase Auth URLs

Go back to **Part 1, step 4** and set **Site URL** and **Redirect URLs** to your live Vercel URL.

### 6. Smoke test

1. Open your Vercel URL
2. Sign up or sign in — you should **not** see a Supabase config error banner
3. Complete onboarding and check **Today** / **Progress** tabs

If you see “Missing Supabase config”, the env vars were not set or you need to trigger a new deployment after adding them.

---

## Part 4 — After deploy

### Make yourself admin

1. Supabase → **Table Editor** → `profiles`
2. Find your user row → set `is_admin` to `true`

Admins can set the challenge start date and remove members.

### Optional: limit who can sign up

For a closed group of ~30 people:

1. Supabase → **Authentication** → **Providers** → **Email**
2. Turn off **Enable sign ups** after everyone has joined, **or**
3. Use invite-only sign-up via Supabase dashboard / manual account creation

### Optional: custom domain

1. Vercel project → **Settings** → **Domains**
2. Add your domain and follow DNS instructions
3. Add the custom domain to Supabase **Redirect URLs**

### Redeploy after code changes

Push to `main` on GitHub — Vercel redeploys automatically if the repo is connected.

Manual redeploy: Vercel dashboard → **Deployments** → **⋯** → **Redeploy**.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page / 404 on refresh | `vercel.json` rewrites should send all routes to `index.html` — already configured |
| “Missing Supabase config” on live site | Add `VITE_*` env vars in Vercel → **Redeploy** |
| Login works locally but not on Vercel | Add Vercel URL to Supabase **Site URL** and **Redirect URLs** |
| `404` on `challenge_settings` | Run `schema-migration-v2.sql` in Supabase SQL Editor |
| `400` errors on habits | Same — run migration v2 |
| Build fails on Vercel | Run `npm run build` locally; fix TypeScript errors, then push |

---

## Local dev (unchanged)

```bash
cp .env.example .env
# Edit .env with the same Supabase URL + anon key as Vercel
npm install
npm run dev
```

Use the **same** Supabase project for local and production so everyone shares one database.
