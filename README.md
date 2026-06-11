# Elevo — Catalog + Inventory Platform

Online catalog and inventory for small businesses (Elevo POC).

- **Local dev:** [README.md](./README.md) — SQLite, no cloud
- **Production deploy (step-by-step):** [docs/DEPLOY.md](./docs/DEPLOY.md)

## Quick start (localhost)

```powershell
cd POC\poc3
.\scripts\setup.ps1
.\scripts\start-all.ps1
```

Open **http://localhost:3000**

## How it works (no Docker)

Instead of local Supabase (which needs Docker), poc3 uses:

| Component | Local solution |
|-----------|----------------|
| Database | **SQLite** file at `data/poc3.db` |
| Auth | Dev OTP + signed session cookie (JWT) |
| Images | Files in `public/uploads/` |

Everything stays on your machine. No cloud account needed.

## Dev login (mock OTP)

1. Enter any valid mobile number (8–20 digits)
2. Click **Send OTP**
3. Enter **any 6-digit code** (dev mode only)
4. Complete onboarding to create your catalog

## Demo flow

1. Sign in with phone `9876543210` + OTP `123456`
2. Create business: **ABC Sports**, WhatsApp `919876543210`
3. Add categories (Cricket, Football) and products with images
4. Open public catalog at `http://localhost:3000/abc-sports`
5. Verify stock is **not** visible on public pages
6. Tap **Enquire on WhatsApp**
7. Add staff from **Staff** page; sign in as staff to update inventory
8. Use inventory tap buttons: `[-5] [-1] [+1] [+5]`

## Manual start

```powershell
npm install
copy .env.example .env.local   # then edit SESSION_SECRET
npm run dev
```

## Environment (`.env.local`)

```
SESSION_SECRET=your-random-secret-at-least-16-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_PATH=./data/poc3.db
```

`setup.ps1` auto-generates `.env.local` with a random `SESSION_SECRET`.

## Optional: Supabase mode (needs Docker)

The `supabase/` folder is kept if you later install Docker and want Postgres + Supabase locally. The app now defaults to SQLite and does not require it.

## Features

- Mobile OTP login (dev bypass)
- Business onboarding with instant catalog URL
- Product & category CRUD (free plan: 20 products, 10 categories)
- Public catalog with search and WhatsApp enquiry
- Inventory management with one-tap adjustments
- Staff users (sales role)
- Inventory activity logs
- Share catalog (WhatsApp, copy link, Facebook)

## Not included (by design)

No shopping cart, payments, checkout, GST, invoicing, or order management.
