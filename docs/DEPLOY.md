# Elevo — Step-by-Step Production Deploy Guide

Follow this guide in order. It deploys **Elevo (poc3)** to **Supabase + Vercel** from **one Git repository**.

| What | Where it runs |
|------|----------------|
| Next.js app (UI + API) | **Vercel** — auto-deploys on `git push` |
| Database + image storage | **Supabase** — you apply migrations once (then again when schema changes) |
| Localhost POC | Your PC — SQLite, unchanged (`ELEVO_BACKEND=sqlite`) |

**Time estimate:** ~45–60 minutes for first deploy (excluding custom domain DNS).

---

## Before you start

### Accounts you need

- [ ] [GitHub](https://github.com) account (code pushed to a repo)
- [ ] [Supabase](https://supabase.com) account (free tier OK to start)
- [ ] [Vercel](https://vercel.com) account (connects to GitHub)

### Tools on your PC

- [ ] **Node.js 20+** — `node -v`
- [ ] **Git** — `git --version`
- [ ] **OpenSSL** (for secret) — or use an online generator

### Code ready

- [ ] Latest code committed and pushed to GitHub
- [ ] Local build passes:

```powershell
cd poc3
npm ci
npm run build
```

---

## How one repo deploys to two services

```
Your GitHub repo
└── poc3/
    ├── src/                      → Vercel builds & hosts this
    └── supabase/migrations/      → You apply this to Supabase (separate step)
```

- **Vercel** watches GitHub and redeploys the app on every push.
- **Supabase** does **not** auto-deploy from Git. You run SQL migrations manually (Steps 3–4 below).
- They connect at runtime via **environment variables** on Vercel.

---

# Part 1 — Supabase (database + storage)

Do this **first**. The app needs a database before it can work in production.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Choose organization, name (e.g. `elevo-prod`), database password, region (pick closest to India if users are in India)
4. Wait until status is **Active**

**✓ Done when:** Project dashboard loads.

---

## Step 2 — Save Supabase credentials

Open **Project Settings** (gear icon) and copy these to a **private note** (not committed to Git):

### A) API keys — Settings → API

| Copy this | Save as env name |
|-----------|------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `service_role` key (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

Use the **service_role** key, not the `anon` key. Never put it in client-side code or `NEXT_PUBLIC_*`.

### B) Database URL — Settings → Database → Connection string

1. Tab: **URI**
2. Mode: **Transaction pooler** (port **6543** — required for Vercel/serverless)
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

Save as: `DATABASE_URL`

Example shape:

```
postgresql://postgres.xxxxxxxxx:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**✓ Done when:** You have 3 values saved: URL, service_role key, DATABASE_URL.

---

## Step 3 — Run the database migration

**Important:** Use migration **`003_elevo_platform.sql` only** for a new project.  
Files `001_schema.sql` and `002_rls.sql` are legacy — do **not** run them on a fresh project.

### Option A — SQL Editor (simplest)

1. Supabase dashboard → **SQL Editor** → **New query**
2. Open this file from your repo:

   `poc3/supabase/migrations/003_elevo_platform.sql`

3. Copy **all** contents, paste into the SQL editor
4. Click **Run**
5. Confirm success (no red errors)

### Option B — Supabase CLI

```bash
cd poc3
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Project ref is in Supabase URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

Then either push only migration 003 via SQL editor, or if your linked project has no prior migrations:

```bash
npx supabase db push
```

If `db push` fails due to old 001/002 files, use **Option A** (SQL editor + 003 only).

**✓ Done when:** Step 4 checks pass.

---

## Step 4 — Verify Supabase setup

In Supabase dashboard:

### Table Editor

Confirm these tables exist:

- [ ] `users`
- [ ] `businesses`
- [ ] `profiles`
- [ ] `staff_accounts`
- [ ] `categories`
- [ ] `products`
- [ ] `inventory_logs`
- [ ] `otp_requests`
- [ ] `subscriptions`

### Storage

- [ ] Bucket **`product-images`** exists (public)

**✓ Part 1 complete** when all boxes are checked.

---

# Part 2 — Vercel (host the app)

---

## Step 5 — Generate a session secret

On your PC (PowerShell or Git Bash):

```bash
openssl rand -base64 32
```

Copy the output. You will use it as `SESSION_SECRET`.

**✓ Done when:** You have a 32+ character random string.

---

## Step 6 — Import project on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. **Import** your GitHub repository
3. Configure project:

| Setting | Value |
|---------|--------|
| **Root Directory** | `poc3` (click Edit if repo root is `POC`) |
| **Framework Preset** | Next.js (auto-detected) |
| **Build Command** | `npm run build` (default) |
| **Install Command** | `npm ci` (from `vercel.json`) |

4. **Do not deploy yet** — add environment variables first (Step 7)

**✓ Done when:** Vercel shows the env vars screen before first deploy.

---

## Step 7 — Add Vercel environment variables

In Vercel → your project → **Settings → Environment Variables**

Add each variable for **Production** (and Preview if you want staging):

| Name | Value | Notes |
|------|-------|-------|
| `ELEVO_BACKEND` | `supabase` | **Required** — switches off SQLite |
| `SESSION_SECRET` | *(output from Step 5)* | Min 32 chars |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` | Use Vercel URL first; change when you add custom domain. **No trailing slash** |
| `NEXT_PUBLIC_SUPABASE_URL` | *(from Step 2A)* | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from Step 2A)* | Server only |
| `DATABASE_URL` | *(from Step 2B)* | Pooler URL, port 6543 |
| `ELEVO_PLATFORM_ADMIN_PHONES` | `9876543210` | Your merchant phone (digits only). Comma-separated for multiple |

### Do NOT add in production

| Name | Why |
|------|-----|
| `ELEVO_DEV_AUTH` | Dev OTP bypass — localhost only |
| `NEXT_PUBLIC_ELEVO_DEV_AUTH` | Same |
| `DATABASE_PATH` | SQLite only — not used on Vercel |

### Add later (when ready)

| Name | When |
|------|------|
| `ELEVO_SMS_WEBHOOK_URL` | Before real users need OTP |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Before paid billing |

**✓ Done when:** All required variables are saved.

---

## Step 8 — Deploy

1. Vercel → **Deployments** → **Redeploy** (or trigger first deploy if you skipped)
2. Wait for build to finish (green **Ready**)
3. Open the deployment URL, e.g. `https://your-project.vercel.app`

If build fails:

- **`ELEVO_BACKEND` missing** → add `supabase` and redeploy
- **Native module / sqlite errors** → confirm `ELEVO_BACKEND=supabase`
- **TypeScript errors** → fix locally, push, redeploy

**✓ Done when:** Home page loads at your Vercel URL.

---

## Step 9 — Set platform admin (Supabase)

On Supabase, `ELEVO_PLATFORM_ADMIN_PHONES` does **not** auto-update the database (unlike localhost SQLite).

After your first merchant signup, run in **SQL Editor**:

```sql
UPDATE users
SET is_platform_admin = true
WHERE phone = '9876543210';  -- same phone as ELEVO_PLATFORM_ADMIN_PHONES
```

Or run **before** first login if you will sign up with that phone:

```sql
-- Optional: pre-create is not needed; run UPDATE after first signup
```

Then log in as that merchant and visit `/platform`.

**✓ Done when:** `/platform` loads for your admin phone (not redirected to dashboard).

---

# Part 3 — Verify production

---

## Step 10 — Smoke test checklist

Use your **Vercel URL** (or custom domain after Step 11).

| # | Test | URL / action | Pass? |
|---|------|--------------|-------|
| 1 | Marketing home | `/` | [ ] |
| 2 | Login page | `/login` | [ ] |
| 3 | Staff login | `/staff-login` | [ ] |
| 4 | Pricing | `/pricing` | [ ] |
| 5 | Merchant signup | `/login` → phone → First time? OTP → set password | [ ] * |
| 6 | Onboarding | Create business name + WhatsApp | [ ] |
| 7 | Dashboard | `/dashboard` — plan usage visible | [ ] |
| 8 | Add category + product | `/categories`, `/products/new` | [ ] |
| 9 | Upload product image | Image appears on product | [ ] |
| 10 | Public catalog | `/{your-slug}` — "Powered by Elevo" footer | [ ] |
| 11 | Staff flow | `/staff` → create staff → `/staff-login` | [ ] |
| 12 | Platform admin | `/platform` (admin phone) | [ ] |

\* **OTP signup / forgot password:** OTP is generated in the database but **SMS is not sent yet**. Until SMS is wired, signup via OTP will fail for real users. See [Step 12 — Before real users](#step-12--before-real-users).

**Quick infra test without SMS:** Use password flow after manually setting a password in DB, or test everything except OTP-dependent flows.

**✓ Done when:** Core flows (6–11) pass.

---

## Step 11 — Custom domain (optional)

1. Vercel → **Settings → Domains** → Add domain (e.g. `app.elevo.in`)
2. Add DNS records Vercel shows (at your registrar)
3. Wait for SSL (usually minutes)
4. Update Vercel env:

   `NEXT_PUBLIC_APP_URL=https://app.elevo.in` (exact match, no trailing slash)

5. **Redeploy** (Deployments → ⋮ → Redeploy)

**✓ Done when:** Site loads on your domain with HTTPS.

---

## Step 12 — Before real users

These are **not** done by deploy alone:

| Item | Status | Action |
|------|--------|--------|
| OTP SMS delivery | **Not implemented** | Wire MSG91/Twilio or `ELEVO_SMS_WEBHOOK_URL` in `src/lib/auth/otp.ts` |
| Razorpay paid plans | **Partial** | Webhook needed before charging ₹499/mo |
| Automated tests | None | Add before scaling |
| Monitoring | None | Add Sentry / Vercel Analytics optional |

**You can deploy today** for internal/demo use. **Do not invite public merchants** until OTP SMS works.

---

# Part 4 — Day-2 operations

---

## When you change app code

```bash
git add .
git commit -m "Your message"
git push
```

Vercel redeploys automatically. **Supabase is not touched.**

---

## When you change database schema

1. Add a new file: `poc3/supabase/migrations/004_your_change.sql`
2. Run it in Supabase **SQL Editor** (or `supabase db push`)
3. Deploy app if code depends on the change

---

## Redeploy manually

Vercel dashboard → **Deployments** → **Redeploy**

Or CLI:

```bash
cd poc3
npx vercel --prod
```

---

## View logs

- **Vercel:** Project → **Logs** (runtime errors, OTP warnings)
- **Supabase:** **Database → Logs**, **Storage** for upload issues

---

# Reference

---

## Environment variables (production / Vercel)

```env
ELEVO_BACKEND=supabase
SESSION_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:[pass]@....pooler.supabase.com:6543/postgres
ELEVO_PLATFORM_ADMIN_PHONES=9876543210
```

Generate secret:

```bash
openssl rand -base64 32
```

---

## Localhost (unchanged)

```powershell
cd poc3
.\scripts\setup.ps1
.\scripts\start-all.ps1
```

Uses `ELEVO_BACKEND=sqlite` (default). No Supabase required locally.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Vercel | Set `ELEVO_BACKEND=supabase` |
| `DATABASE_URL` connection error | Use **Transaction pooler** URL (port **6543**), correct password |
| `403 Forbidden` on login/API | `NEXT_PUBLIC_APP_URL` must match browser URL exactly |
| Product images 404 | Check `product-images` bucket exists (Step 4) |
| OTP never arrives | SMS not wired — see Step 12 |
| `/platform` redirects away | Run SQL `UPDATE users SET is_platform_admin = true` (Step 9) |
| Migration errors on 001/002 | Use **003 only** on fresh project (Step 3) |
| Localhost broken | Keep `ELEVO_BACKEND=sqlite` in `.env.local` |

---

## Alternative: VPS + SQLite

If you prefer a single Linux server instead of Vercel + Supabase:

- Set `ELEVO_BACKEND=sqlite`
- Use `DATABASE_PATH` + `public/uploads/` on persistent disk
- Run with PM2 + Nginx

See archived notes in git history or ask for a VPS appendix if needed.

---

## Production routes

| Path | Purpose |
|------|---------|
| `/` | Marketing home |
| `/login` | Merchant login |
| `/staff-login` | Staff login |
| `/dashboard` | Merchant admin |
| `/{slug}` | Public catalog |
| `/platform` | Platform admin |
| `/pricing` | Plans |

---

## Deploy checklist (printable)

```
Part 1 — Supabase
[ ] Step 1  Create project
[ ] Step 2  Save URL, service_role, DATABASE_URL
[ ] Step 3  Run 003_elevo_platform.sql
[ ] Step 4  Verify tables + product-images bucket

Part 2 — Vercel
[ ] Step 5  Generate SESSION_SECRET
[ ] Step 6  Import repo (root: poc3)
[ ] Step 7  Add all env vars
[ ] Step 8  Deploy — home page loads
[ ] Step 9  Platform admin SQL

Part 3 — Verify
[ ] Step 10 Smoke test
[ ] Step 11 Custom domain (optional)
[ ] Step 12 SMS before real users
```

---

*Local dev: [README.md](../README.md)*
