# thrones-db-revamp

Redesigned deck-building companion site for the Game of Thrones LCG 2nd
Edition. Design handoff lives in `design_handoff_thronesdb_redesign/` (the
`.dc.html` files are prototype references for interaction/layout — read them
for the intended UX, don't port their code or placeholder logic literally).

## Stack and binding decisions

- **Frontend**: React + Vite + TypeScript, TanStack Query for server state,
  React Router, Tailwind (tokens in `frontend/tailwind.config.ts` — use
  `bg`/`surface`/`text`/`textMuted`/`accent`/`success`/`danger`, not raw colors).
- **Backend**: Express + TypeScript (explicitly **not** Fastify — user
  preference). `express-async-errors` is loaded so async route handlers can
  throw without manual try/catch-to-next wiring.
- **DB**: Postgres + Drizzle ORM. Schema in `backend/src/db/schema.ts`,
  migrations in `backend/src/db/migrations/` (generate with
  `npm run db:generate --workspace=backend`, apply with `npm run db:migrate`).
- **Auth**: hand-rolled cookie-session auth — **not** JWT, **not**
  localStorage, **not** a third-party auth service. `users`/`sessions` tables,
  `@node-rs/argon2` password hashing, HTTP-only cookie. See
  `backend/src/services/auth.ts` and `backend/src/middleware/requireAuth.ts`.
- **Card data**: real data from `throneteki/throneteki-json-data` (the
  maintained successor — **not** the archived `thronesdb-json-data`), imported
  via `backend/src/scripts/importCards.ts`
  (`npm run db:seed --workspace=backend -- --packs=Core --skip-images` for a
  fast subset). Card art URLs come from ThronesDB's public API since the data
  repo doesn't carry images.
- **MVP scope**: Cards search + Deck builder only. Home/Reviews/Rules are
  intentionally `ComingSoonPage` stubs — don't build these out without asking.

## Deck legality engine

`packages/shared/src/legality.ts` is a **real** AGoT 2e Joust/Melee legality
checker, ported from `throneteki/throneteki-deck-helper` (same maintainers as
the card data source) — not reverse-engineered from the design prototype's
placeholder card-count math. It combines:
- Base rules: 60-card draw minimum, exactly 7 plots, per-card `deck_limit`,
  loyal-card-must-match-faction.
- `packages/shared/src/data/agendaRules.ts` — per-agenda deckbuilding
  modifiers (banner factions, size overrides, `mayInclude`/`cannotInclude`,
  etc.), ported from the same reference engine.
- `packages/shared/src/data/restrictedList.ts` — a **snapshot** of the
  currently-active restricted/banned card list pulled from
  `throneteki-json-data`'s `restricted-list.json`. When the FAQ/errata updates,
  replace this constant wholesale — it's a data edit, not a code change.

**Known scope cut**: the Alliance agenda (06018) isn't modeled — it lets a
deck carry up to 2 additional "banner" agendas, which the `Deck` schema
(single `agendaCode: string | null`) can't represent. Flagged in code
comments, not silently dropped.

## Repo layout

```
backend/src/
  db/schema.ts, db/migrations/     Drizzle schema + migrations
  routes/, services/                one pair per resource (cards, factions, auth, decks)
  middleware/requireAuth.ts         attachUser (reads cookie) + requireAuth (guards routes)
  scripts/importCards.ts            card data importer
frontend/src/
  api/                               thin fetch wrappers, one per backend resource
  hooks/                             TanStack Query hooks wrapping api/
  components/<domain>/, pages/       cards/, deckbuilder/, auth/, layout/
  lib/a11y.ts                        clickableProps() — keyboard support for div-as-button tiles
packages/shared/src/
  types.ts                           shared DTOs (Card, Deck, DeckDetailResponse, etc.)
  legality.ts, data/                 the legality engine described above
e2e/                                 Playwright smoke test (separate workspace, own package.json)
```

Ownership pattern worth reusing: `backend/src/services/decks.ts`'s
`loadOwnedDeck` throws `NotFoundError` for *both* "doesn't exist" and
"belongs to another user" — routes map that to a 404, never a 403, so the API
never confirms a resource's existence to a non-owner.

## Commands

```
npm run dev              # backend (:4000) + frontend (:5173) concurrently
npm run typecheck / lint / test / build      # across workspaces
npm run db:migrate       # apply migrations
npm run db:seed --workspace=backend -- --packs=Core --skip-images   # fast local card data
npm run test --workspace=e2e   # Playwright smoke test (needs both dev servers running + seeded DB)
```

Postgres runs via `docker compose up -d` (service `postgres`, port 5432,
creds `thrones`/`thrones`/`thronesdb` — see `docker-compose.yml`).

## Known limitations

- No browser/screenshot tool is available in this environment. UI changes are
  verified via typecheck/lint/vitest/curl and the Playwright smoke test (which
  does drive a real headless browser), but a human visual pass against the
  design prototype is still worth doing before shipping UI changes.
- Decks list page (`DecksListPage`) is a minimal addition beyond the original
  MVP file list — it exists because without it the deck builder had no entry
  point from the UI. Keep it minimal; the full decks-browsing experience is
  still out of scope.
