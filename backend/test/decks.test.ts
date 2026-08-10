import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { db, pool } from "../src/db/client.js";
import { cards, cycles, decks, factions, packs, types, users } from "../src/db/schema.js";
import {
  NotFoundError,
  createDeck,
  deleteDeck,
  getDeckForUser,
  listDecksForUser,
  setDeckCard,
  updateDeck,
} from "../src/services/decks.js";

const CHARACTER_CODE = "DECKTEST-CHAR";
const PLOT_CODE = "DECKTEST-PLOT";
const OWNER_ID = randomUUID();
const OTHER_ID = randomUUID();

async function seed() {
  await db.insert(cycles).values({ code: "core", name: "Core Set", position: 0 }).onConflictDoNothing();
  await db
    .insert(packs)
    .values({ code: "Core", name: "Core Set", cycleCode: "core", position: 0, size: 2, dateRelease: null })
    .onConflictDoNothing();
  await db
    .insert(factions)
    .values([
      { code: "stark", name: "Stark", isPrimary: true },
      { code: "neutral", name: "Neutral", isPrimary: false },
    ])
    .onConflictDoNothing();
  await db
    .insert(types)
    .values([
      { code: "character", name: "Character" },
      { code: "plot", name: "Plot" },
    ])
    .onConflictDoNothing();
  await db
    .insert(cards)
    .values([
      {
        code: CHARACTER_CODE,
        name: "Test Character",
        typeCode: "character",
        factionCode: "stark",
        cost: 3,
        deckLimit: 3,
        packCode: "Core",
        position: 1,
      },
      {
        code: PLOT_CODE,
        name: "Test Plot",
        typeCode: "plot",
        factionCode: "stark",
        deckLimit: 1,
        packCode: "Core",
        position: 2,
      },
    ])
    .onConflictDoNothing();
  await db
    .insert(users)
    .values([
      { id: OWNER_ID, email: "owner@decktest.local", username: "deckowner", passwordHash: "x" },
      { id: OTHER_ID, email: "other@decktest.local", username: "deckother", passwordHash: "x" },
    ])
    .onConflictDoNothing();
}

beforeAll(async () => {
  await seed();
});

afterAll(async () => {
  await db.delete(cards).where(sql`code in (${CHARACTER_CODE}, ${PLOT_CODE})`);
  await db.delete(users).where(sql`id in (${OWNER_ID}, ${OTHER_ID})`);
  await pool.end();
});

describe("decks service", () => {
  it("creates, lists, and fetches a deck with legality for its owner", async () => {
    const deck = await createDeck(OWNER_ID, {
      name: "My Deck",
      factionCode: "stark",
      agendaCode: null,
      format: "joust",
    });

    const list = await listDecksForUser(OWNER_ID);
    expect(list.map((d) => d.id)).toContain(deck.id);

    const detail = await getDeckForUser(OWNER_ID, deck.id);
    expect(detail.legality.legal).toBe(false);
    expect(detail.legality.errors).toContain("Too few draw cards (0/60)");

    await deleteDeck(OWNER_ID, deck.id);
  });

  it("hides another user's deck behind NotFoundError, not just forbidden", async () => {
    const deck = await createDeck(OWNER_ID, {
      name: "Private Deck",
      factionCode: "stark",
      agendaCode: null,
      format: "joust",
    });

    await expect(getDeckForUser(OTHER_ID, deck.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(updateDeck(OTHER_ID, deck.id, { name: "Hijacked" })).rejects.toBeInstanceOf(NotFoundError);
    await expect(deleteDeck(OTHER_ID, deck.id)).rejects.toBeInstanceOf(NotFoundError);

    await deleteDeck(OWNER_ID, deck.id);
  });

  it("throws NotFoundError for a deck id that doesn't exist", async () => {
    await expect(getDeckForUser(OWNER_ID, randomUUID())).rejects.toBeInstanceOf(NotFoundError);
  });

  it("upserts and removes deck cards, and reflects them in legality", async () => {
    const deck = await createDeck(OWNER_ID, {
      name: "Card Math",
      factionCode: "stark",
      agendaCode: null,
      format: "joust",
    });

    await setDeckCard(OWNER_ID, deck.id, CHARACTER_CODE, 3);
    let detail = await getDeckForUser(OWNER_ID, deck.id);
    expect(detail.cards).toEqual([{ cardCode: CHARACTER_CODE, count: 3 }]);
    expect(detail.legality.drawCount).toBe(3);

    await setDeckCard(OWNER_ID, deck.id, PLOT_CODE, 7);
    detail = await getDeckForUser(OWNER_ID, deck.id);
    expect(detail.legality.plotCount).toBe(7);

    await setDeckCard(OWNER_ID, deck.id, CHARACTER_CODE, 0);
    detail = await getDeckForUser(OWNER_ID, deck.id);
    expect(detail.cards.find((c) => c.cardCode === CHARACTER_CODE)).toBeUndefined();

    await deleteDeck(OWNER_ID, deck.id);
  });
});
