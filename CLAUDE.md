# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Construction Cost Tracker — a full-stack app for tracking construction project expenses (materials and labor) with budget monitoring and category-based breakdowns.

## Monorepo Structure

pnpm workspaces with three packages:
- **packages/backend** — Next.js 15 API server (port 3001), Prisma ORM, SQLite, JWT auth
- **packages/frontend** — Vite + React 19 SPA (port 5173), MUI 6, MobX 6, React Router 7
- **packages/shared** — TypeScript type definitions only (no runtime code)

## Commands

```bash
pnpm install                          # Install all dependencies
pnpm dev                              # Run backend + frontend concurrently
pnpm dev:backend                      # Next.js API server on :3001
pnpm dev:frontend                     # Vite dev server on :5173
pnpm build                            # Build shared → backend → frontend (sequential)
pnpm db:push                          # Push Prisma schema to SQLite
pnpm db:seed                          # Seed database
pnpm --filter backend prisma generate # Regenerate Prisma client after schema changes
```

## Architecture

### Backend (Next.js App Router API)

Routes live in `packages/backend/src/app/api/`. Each route file exports named async functions (`GET`, `POST`, `PUT`, `DELETE`).

- **Auth**: JWT with 7-day expiry, Bearer token in Authorization header. `requireAuth()` middleware extracts user from token.
- **Database**: Prisma with SQLite (`dev.db`). Schema at `packages/backend/prisma/schema.prisma`.
- **API response format**: Always `{ data: T }` on success or `{ error: string }` on failure.
- **Default categories**: Auto-seeded when a project is created (6 material + 4 labor categories).

### Frontend (React SPA)

- **State management**: MobX stores (`AuthStore`, `ProjectStore`, `ExpenseStore`) coordinated by `RootStore` via React Context. Stores persist auth state to localStorage.
- **API layer**: Axios instance in `packages/frontend/src/api/` with interceptors for token injection and auto-logout on 401.
- **Routing**: React Router with `AuthGuard` (requires login) and `GuestOnly` HOCs wrapping route components.
- **UI**: Material-UI with construction-themed palette (amber primary, slate secondary). Recharts for dashboard visualizations.

### Shared Types

All shared TypeScript interfaces in `packages/shared/src/index.ts`. Two expense types: `MATERIAL` (quantity, unit, unitPrice, supplier) and `LABOR` (workerName, hoursWorked, hourlyRate).

### Key Patterns

- MobX `observer()` HOC on all components that read store state
- `runInAction()` for state mutations after async calls
- Frontend proxies `/api` requests to backend via Vite config
- Expense amounts auto-calculated: material = quantity × unitPrice, labor = hoursWorked × hourlyRate