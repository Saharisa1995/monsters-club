# Monsters' Club — setup guide

This is a real web app with a cloud backend (Supabase) and email/password
accounts. Once set up, anyone can open it on iPhone or Android, sign in,
and "Add to Home Screen" so it behaves like an installed app — no app
store needed.

## 1. Create your free Supabase project

1. Go to https://supabase.com and sign up (free tier is enough for this).
2. Click **New project**. Pick any name/region, set a database password
   (save it somewhere), and wait ~2 minutes for it to spin up.
3. In your new project, go to the **SQL Editor** (left sidebar).
4. Open `schema.sql` from this folder, copy all of it, paste it into the
   SQL editor, and click **Run**. This creates the `profiles`, `habits`,
   and `habit_logs` tables with the right permissions already locked down.
5. Go to **Project Settings -> API**. You'll need two values from there:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

## 2. Connect the app to your project

1. Open `config.js` in this folder.
2. Replace the placeholder values:

```js
window.SUPABASE_URL = "https://abcdefgh.supabase.co";
window.SUPABASE_ANON_KEY = "paste-your-anon-key-here";
```

3. Save the file.

## 3. (Recommended) Turn off email confirmation for a closed group

By default Supabase requires people to click a confirmation link in their
email before they can sign in. For a small private group this is usually
unnecessary friction. To turn it off:

1. In Supabase, go to **Authentication -> Providers -> Email**.
2. Turn off **Confirm email**.
3. Save.

(You can leave it on if you'd rather have email verification.)

## 4. Put the app online

The app is plain HTML/JS/CSS — any static host works. The easiest free
options:

**Option A — Netlify (drag and drop, no account needed for a quick test)**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. You'll get a live URL like `https://random-name.netlify.app` instantly.

**Option B — Vercel, GitHub Pages, Cloudflare Pages**
Any of these work the same way — upload the folder, get a URL. All of
them serve HTTPS by default, which is required for the "Add to Home
Screen" install prompt to show up on iOS/Android.

Do **not** just double-click `index.html` to open it from your computer's
file system — service workers (needed for the installable app behavior)
only work over `https://` or `http://localhost`, not `file://`.

## 5. Install it on a phone

**iPhone (Safari):**
1. Open your live URL in Safari.
2. Tap the Share icon -> **Add to Home Screen**.
3. It now opens full-screen from the home screen like a real app.

**Android (Chrome):**
1. Open your live URL in Chrome.
2. Tap the menu (⋮) -> **Add to Home screen** / **Install app**.
3. Same result — a real home-screen icon, no browser bar.

## 6. Using it

- First person to sign up and create a profile automatically becomes the
  founding **admin**.
- Admins can remove members from the People tab. New members join
  themselves by opening the app link, signing up, and creating their own
  profile — there's no invite code needed since this is meant for a
  trusted private group.
- Everyone can only check off their own habits. The leaderboard and
  People list show everyone, for accountability.
- Leaderboard has two views: **Daily** (today's completion %) and
  **75-day total** (completion % over the last 75 days).

## Files in this folder

| File | Purpose |
|---|---|
| `index.html` | App shell, all styling |
| `app.js` | All app logic + Supabase calls |
| `config.js` | Your Supabase URL/key go here |
| `manifest.json` | Makes it installable as a PWA |
| `sw.js` | Service worker for offline caching |
| `schema.sql` | Database schema — run once in Supabase |
| `icon-192.png`, `icon-512.png` | App icons |

## Troubleshooting

- **"Couldn't load data" on sign-in** — double check `config.js` has the
  right URL and anon key, and that you ran `schema.sql` successfully.
- **Install prompt doesn't appear** — must be served over HTTPS, and on
  iOS the "Add to Home Screen" option is manual (no automatic prompt).
- **Want to promote someone to admin later** — easiest way is in
  Supabase: **Table Editor -> profiles -> find their row -> set
  `is_admin` to `true`**.
