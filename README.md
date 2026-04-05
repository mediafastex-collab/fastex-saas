# Fastex Admin SaaS Rebuild

This folder contains the new SaaS-ready rebuild of the current prototype.

## Why this exists

The old `index.html` app is a strong prototype, but it is still:

- browser-storage based
- single-file
- not built for true multi-tenant SaaS

This new app is structured for:

- real web deployment
- multi-tenant organizations
- role-based access
- separate super admin and customer workspaces
- real database-backed modules

## Stack

- `Next.js`
- `TypeScript`
- `Supabase Auth`
- `PostgreSQL`
- `Prisma`

## First run later

After installing dependencies:

```bash
npm install
npm run dev
```

## Key routes

- `/login`
- `/admin`
- `/workspace`
- `/api/health`

## Immediate next build phases

1. Replace mock session/data with Supabase auth and real server queries.
2. Add shared table/form components for clients, services, packages, onboarding, and finance.
3. Build tenant-safe create/edit flows with server actions.
4. Add Stripe billing and organization provisioning.
