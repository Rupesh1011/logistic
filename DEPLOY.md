# Deploy to Vercel (developer-only checklist)

This is a one-time setup. The owner does **not** run any of these commands. They just open the deployed URL in a browser.

## What lives where

- **Public site + admin UI** → static + SSR served by Vercel.
- **Admin reads/writes for freight rates / branches / delivery stories** → TanStack Start server functions backed by **Vercel KV**. Server-side only; no SDK shipped to the browser.
- **Lead capture** → EmailJS (free tier) plus a per-visitor copy in `localStorage` (the admin Leads tab reads this from the admin's browser).
- **Admin login** → client-side bcrypt check against the hash you bake into env vars.

## Step 1 — Push the repo to GitHub

Vercel imports from a Git host.

```bash
git add .
git commit -m "Initial Trinetra deploy"
git push origin main
```

If the repo has secrets in `.env`, double-check `.env` is in `.gitignore` (it is). Only `.env.example` should be committed.

## Step 2 — Create the Vercel project

1. https://vercel.com → New Project → Import the GitHub repo.
2. Framework preset: **Other** (Vercel auto-detects from `vercel.json`).
3. Build command: `npm run build` (already set in `vercel.json`).
4. Output directory: `dist/client` (already set in `vercel.json`).
5. **Don't deploy yet** — click _Skip_ if it asks, or stop after the project is created.

## Step 3 — Connect Upstash Redis

1. In your Vercel project dashboard → **Storage** → **Connect Database**.
2. Choose **Upstash Redis** → select the database you already created (the free one with 500K commands/month is more than enough).
3. Click **Connect** → select all environments (Production, Preview, Development).

Vercel automatically injects these env vars into every deployment:

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

You don't need to copy these by hand. The server-side code reads them directly.

## Step 4 — Add the rest of the env vars

Project → **Settings** → **Environment Variables**. Add each for **Production, Preview, Development**:

| Key                          | Value                                      | Notes                                                                 |
| ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `VITE_EMAILJS_SERVICE_ID`    | (from emailjs.com)                         | Free tier                                                             |
| `VITE_EMAILJS_TEMPLATE_ID`   | (from emailjs.com)                         | Free tier                                                             |
| `VITE_EMAILJS_PUBLIC_KEY`    | (from emailjs.com)                         | Safe to ship                                                          |
| `VITE_ADMIN_EMAIL`           | owner email                                | What the owner types into login                                       |
| `VITE_ADMIN_PASSWORD_HASH`   | bcrypt hash of the owner's password        | Generate locally with the command below                               |
| `ADMIN_PASSWORD_HASH`        | **same value** as `VITE_ADMIN_PASSWORD_HASH` | Used by the server function to authorise writes                       |

> **Important:** The bcrypt hash starts with `$2b$10$...`. In Vercel's UI just paste it as-is — Vercel doesn't do dotenv-style `$` expansion. If you ever put it in a local `.env` file, wrap it in **single quotes** (`'$2b$10$...'`).

To generate a hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

## Step 5 — Deploy

Project → **Deployments** → **Redeploy** (or just push another commit). First deploy will succeed and you'll have `https://your-project.vercel.app`.

## Step 6 — One-time sanity check

1. Open the deployed URL → home page renders, freight estimator computes a rate.
2. Click _Get Indicative Rate_ → click the unlock button → submit the lead form. Check that you receive the EmailJS email.
3. Visit `/login` → log in with your owner email + password. You should land at `/admin`.
4. In the Admin Panel, click **Add** under Freight Rates. Save. Open the public `/freight-rates` page in a different browser (or an incognito window). The new row should appear.
5. Repeat for Branches and Delivery Stories.

If step 4 fails ("Could not save: forbidden"), double-check that `ADMIN_PASSWORD_HASH` and `VITE_ADMIN_PASSWORD_HASH` hold the same value in Vercel's env settings.

## How the owner uses it

- Public URL: `https://your-project.vercel.app/`
- Admin URL: `https://your-project.vercel.app/login` → log in once → land at `/admin`.

That's it. The owner just clicks Add/Edit/Delete. Every visitor sees the changes on next page load. Nothing to install.

## Local development (you only)

1. Pull the repo, run `npm install`.
2. Copy `.env.example` to `.env` and fill in your test values. Wrap the bcrypt hash in single quotes.
3. `npm run dev` → http://localhost:8080 (or 8081 if 8080 is busy).
4. With no KV vars, admin edits write to a local `.kv-local/` folder (gitignored). With `vercel env pull .env.local`, your local dev hits the real KV.

## Cost

Free tier on Vercel covers everything for a low-traffic logistics site:

- Hobby project: 100 GB bandwidth/month, unlimited deployments.
- KV: 30K commands/day, 256 MB storage.
- EmailJS: 200 emails/month free.

You'll hit none of these for this use case.
