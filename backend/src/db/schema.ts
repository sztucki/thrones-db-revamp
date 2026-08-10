// Full schema (factions, cycles, packs, types, cards, users, sessions, decks,
// deck_cards) is built out in Phase 2 of the plan. This placeholder keeps
// drizzle-kit and the app wiring functional during the Phase 1 scaffold.
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const healthChecks = pgTable("health_checks", {
  id: text("id").primaryKey(),
  checkedAt: timestamp("checked_at", { withTimezone: true }).defaultNow().notNull(),
});
