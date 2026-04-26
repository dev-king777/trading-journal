# EdgeJournal

Personal trading journal built with Next.js and Supabase.

## Features

- Supabase email/password auth
- Empty dashboard for new users
- Trading account creation
- Persistent trade logging
- Local analytics, goals, reports, and rule-based insights
- CSV import support

## Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```
