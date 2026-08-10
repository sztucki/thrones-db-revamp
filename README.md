# ThronesDB Revamp

A redesigned deck-building companion site for *A Game of Thrones: The Card
Game* (2nd Edition) — card search and a full deck builder with real
tournament legality checking.

Current scope (MVP): **Cards search** and **Deck builder**. Home, Reviews,
and Rules are placeholder pages for now.

## Stack

- **Frontend**: React + Vite + TypeScript, TanStack Query, React Router,
  Tailwind CSS
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: hand-rolled cookie-session auth (HTTP-only session cookie,
  argon2-hashed passwords) — no third-party auth service
- **Card data**: imported from [`throneteki/throneteki-json-data`](https://github.com/throneteki/throneteki-json-data)
- **Monorepo**: npm workspaces (`frontend`, `backend`, `packages/shared`, `e2e`)

For deeper architectural context and decisions, see [`CLAUDE.md`](./CLAUDE.md).

## Prerequisites

- Node.js 22+
- Docker (for local Postgres)

## Getting started

```bash
npm install
docker compose up -d          # starts Postgres on localhost:5432
cp .env.example backend/.env
cp .env.example frontend/.env # only VITE_API_URL is read by the frontend
npm run db:migrate
npm run db:seed --workspace=backend -- --packs=Core --skip-images
npm run dev
```

This starts the backend on `http://localhost:4000` and the frontend on
`http://localhost:5173`.

### Loading more card data

`db:seed` runs `backend/src/scripts/importCards.ts`, which pulls card, pack,
and cycle data from `throneteki-json-data` and (optionally) card art URLs
from ThronesDB's public API.

```bash
npm run db:seed --workspace=backend                       # every pack, with images
npm run db:seed --workspace=backend -- --packs=Core,AtG    # only specific packs
npm run db:seed --workspace=backend -- --skip-images       # skip the image lookup (faster)
npm run db:seed --workspace=backend -- --concurrency=10    # tune image-fetch concurrency
```

## Project layout

```
backend/src/
  db/schema.ts, db/migrations/   Drizzle schema and migrations
  routes/, services/             one pair per resource: cards, factions, auth, decks
  middleware/                    requireAuth, cors, error handling
  scripts/importCards.ts         card data importer

frontend/src/
  api/                           fetch wrappers, one per backend resource
  hooks/                         TanStack Query hooks wrapping api/
  components/, pages/            cards/, deckbuilder/, auth/, layout/

packages/shared/src/
  types.ts                       DTOs shared between frontend and backend
  legality.ts, data/             AGoT 2e deck legality engine + agenda rules + restricted list

e2e/                              Playwright smoke test (separate workspace)
```

## Common commands

Run from the repo root unless noted:

| Command | Description |
|---|---|
| `npm run dev` | Run backend + frontend together |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Unit tests (backend + shared) |
| `npm run test --workspace=e2e` | Playwright smoke test (needs the dev servers running and the DB seeded) |
| `npm run build` | Production build of shared → backend → frontend |
| `npm run db:migrate` | Apply pending Drizzle migrations |
| `npm run db:generate --workspace=backend` | Generate a new migration from schema changes |

## Environment variables

See [`.env.example`](./.env.example). Backend reads from `backend/.env`;
frontend reads `VITE_API_URL` from `frontend/.env` (defaults to
`http://localhost:4000/api` if unset).

## Testing

- **Unit/integration tests** (`backend`, `packages/shared`) run with Vitest
  and require the local Postgres from `docker compose` to be up.
- **End-to-end smoke test** (`e2e/`) drives a real browser via Playwright
  through the signup → deck creation → card search → legality flow. Requires
  both dev servers running and the database seeded with at least the `Core`
  pack. CI runs this automatically on every push/PR.

## Deck legality

The deck builder checks real AGoT 2e Joust/Melee tournament legality — deck
size, plot count, per-card limits, agenda-specific rules, and the current
restricted/banned card list — ported from the reference implementation in
[`throneteki/throneteki-deck-helper`](https://github.com/throneteki/throneteki-deck-helper).
See `packages/shared/src/legality.ts` and `packages/shared/src/data/` for
details, including the one documented scope cut (the Alliance agenda).
