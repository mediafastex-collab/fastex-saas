# Fastex Admin SaaS Architecture

## Product split

- `Super Admin` app
  - your internal control panel
  - organizations, subscriptions, support, audit
- `Workspace` app
  - the product customers actually buy
  - clients, services, packages, onboarding, finance

## Stack

- Frontend: `Next.js App Router` + `React` + `TypeScript`
- Backend: `Next.js server layer` first
- Database: `PostgreSQL`
- ORM: `Prisma`
- Auth: `Supabase Auth`
- Storage: `Supabase Storage` or `Cloudflare R2`
- Billing: `Stripe`

## Multi-tenant model

Every business is an `Organization`.

Every row for customer data must include:

- `organizationId`

That includes:

- services
- packages
- clients
- tasks
- invoices
- payments

## Roles

- `platform_owner`
- `platform_admin`
- `agency_owner`
- `agency_admin`
- `team_member`

## Scaling direction

For 1k+ users, keep this as a modular monolith first:

- one codebase
- one database
- one auth provider
- one billing provider

Move to queues/background workers before considering microservices.
