# Construction Cost Tracker

A full-stack web application for tracking construction project expenses. Helps manage budgets, categorize costs by materials and labor, and visualize spending breakdowns.

## Features

- **Project management** — create projects with optional budgets, track spending vs. budget in real time
- **Expense tracking** — log material purchases (quantity, unit price, supplier) and labor costs (worker, hours, hourly rate)
- **Categories** — expenses organized by categories (Foundation, Walls, Roof, Plumbing, Electrical, etc.), with defaults auto-created per project
- **Dashboard** — visual charts and summary cards showing cost breakdowns by category and type
- **Authentication** — JWT-based user accounts, each user sees only their own projects

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | React 19, Vite, Material-UI 6, MobX, Recharts  |
| Backend  | Next.js 15 (API routes), Prisma, SQLite         |
| Shared   | TypeScript type definitions                     |
| Package  | pnpm workspaces (monorepo)                      |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
pnpm db:push
pnpm db:seed    # optional: seed the database
```

### Development

```bash
pnpm dev
```

This starts the backend API on `http://localhost:3001` and the frontend on `http://localhost:5173`.

### Build

```bash
pnpm build
```

## Project Structure

```
packages/
  backend/    — Next.js API server, Prisma schema, auth middleware
  frontend/   — React SPA, MobX stores, MUI components
  shared/     — TypeScript interfaces shared between packages
```