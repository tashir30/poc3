# Supabase + Vercel (quick reference)

**Full step-by-step guide:** [DEPLOY.md](./DEPLOY.md) — follow Steps 1–12 in order.

## One repo, two services

| Service | What deploys | How |
|---------|--------------|-----|
| **Supabase** | Database + storage | Run `003_elevo_platform.sql` once (Step 3) |
| **Vercel** | Next.js app | Connect GitHub, root `poc3`, push to deploy |

## Minimum Vercel env

```env
ELEVO_BACKEND=supabase
SESSION_SECRET=<32+ chars>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...@...pooler.supabase.com:6543/postgres
ELEVO_PLATFORM_ADMIN_PHONES=9876543210
```

## Platform admin (after first signup)

```sql
UPDATE users SET is_platform_admin = true WHERE phone = '9876543210';
```

Localhost: [README.md](../README.md) — `ELEVO_BACKEND=sqlite`, no cloud required.
