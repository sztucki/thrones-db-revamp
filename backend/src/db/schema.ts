import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const types = pgTable("types", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
});

export const factions = pgTable("factions", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  isPrimary: boolean("is_primary").notNull().default(true),
  octgnId: text("octgn_id"),
});

export const cycles = pgTable("cycles", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
});

export const packs = pgTable("packs", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  cycleCode: text("cycle_code")
    .notNull()
    .references(() => cycles.code),
  position: integer("position").notNull(),
  size: integer("size"),
  dateRelease: text("date_release"),
});

export const cards = pgTable(
  "cards",
  {
    code: text("code").primaryKey(),
    name: text("name").notNull(),
    typeCode: text("type_code")
      .notNull()
      .references(() => types.code),
    factionCode: text("faction_code")
      .notNull()
      .references(() => factions.code),
    cost: integer("cost"),
    // Source data allows non-numeric cost ("X", "-") on a handful of cards;
    // cost is null for those and the original token is kept here.
    costRaw: text("cost_raw"),
    income: integer("income"),
    initiative: integer("initiative"),
    claim: integer("claim"),
    reserve: integer("reserve"),
    text: text("text").notNull().default(""),
    traitsRaw: text("traits_raw").notNull().default(""),
    traits: text("traits").array().notNull().default(sql`'{}'::text[]`),
    isLoyal: boolean("is_loyal").notNull().default(false),
    isUnique: boolean("is_unique").notNull().default(false),
    isMilitary: boolean("is_military").notNull().default(false),
    isIntrigue: boolean("is_intrigue").notNull().default(false),
    isPower: boolean("is_power").notNull().default(false),
    strength: integer("strength"),
    deckLimit: integer("deck_limit").notNull().default(3),
    quantityInPack: integer("quantity_in_pack").notNull().default(1),
    packCode: text("pack_code")
      .notNull()
      .references(() => packs.code),
    illustrator: text("illustrator"),
    flavor: text("flavor"),
    octgnId: text("octgn_id"),
    position: integer("position").notNull().default(0),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    factionIdx: index("cards_faction_idx").on(table.factionCode),
    typeIdx: index("cards_type_idx").on(table.typeCode),
    costIdx: index("cards_cost_idx").on(table.cost),
    traitsIdx: index("cards_traits_idx").using("gin", table.traits),
    // No persisted tsvector column (avoids a tsvector/text type mismatch on a
    // Drizzle `text()` generated column) — queries must use this exact
    // to_tsvector(...) expression so the planner can use this index.
    searchIdx: index("cards_search_idx").using(
      "gin",
      sql`to_tsvector('english', coalesce(${table.name}, '') || ' ' || coalesce(${table.text}, ''))`
    ),
  })
);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const decks = pgTable("decks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  factionCode: text("faction_code")
    .notNull()
    .references(() => factions.code),
  agendaCode: text("agenda_code").references(() => cards.code),
  format: text("format").notNull().default("joust"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const deckCards = pgTable(
  "deck_cards",
  {
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    cardCode: text("card_code")
      .notNull()
      .references(() => cards.code),
    count: integer("count").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.deckId, table.cardCode] }),
  })
);

export const importRuns = pgTable("import_runs", {
  id: text("id").primaryKey(),
  packCodes: text("pack_codes").array().notNull(),
  cardsInserted: integer("cards_inserted").notNull().default(0),
  cardsUpdated: integer("cards_updated").notNull().default(0),
  cardsSkipped: integer("cards_skipped").notNull().default(0),
  ranAt: timestamp("ran_at", { withTimezone: true }).defaultNow().notNull(),
});
