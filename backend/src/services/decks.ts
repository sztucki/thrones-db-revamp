import { randomUUID } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { Card, CardTypeCode, DeckCardEntry, DeckDetailResponse, DeckFormat, DeckSummary } from "@thronesdb/shared";
import { checkLegality } from "@thronesdb/shared";
import { db } from "../db/client.js";
import { cards, deckCards, decks } from "../db/schema.js";

export class NotFoundError extends Error {}

function toCard(row: typeof cards.$inferSelect): Card {
  return {
    ...row,
    typeCode: row.typeCode as CardTypeCode,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createDeck(
  userId: string,
  input: { name: string; factionCode: string; agendaCode: string | null; format: DeckFormat }
) {
  const [deck] = await db
    .insert(decks)
    .values({
      id: randomUUID(),
      userId,
      name: input.name,
      factionCode: input.factionCode,
      agendaCode: input.agendaCode,
      format: input.format,
    })
    .returning();
  return deck;
}

export async function listDecksForUser(userId: string): Promise<DeckSummary[]> {
  const rows = await db
    .select({
      id: decks.id,
      name: decks.name,
      factionCode: decks.factionCode,
      agendaCode: decks.agendaCode,
      format: decks.format,
      updatedAt: decks.updatedAt,
      cardCount: sql<number>`coalesce(sum(${deckCards.count}), 0)::int`,
    })
    .from(decks)
    .leftJoin(deckCards, eq(deckCards.deckId, decks.id))
    .where(eq(decks.userId, userId))
    .groupBy(decks.id)
    .orderBy(decks.updatedAt);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    factionCode: r.factionCode,
    agendaCode: r.agendaCode,
    format: r.format as DeckFormat,
    cardCount: r.cardCount,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

async function loadOwnedDeck(userId: string, deckId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);
  if (!deck) throw new NotFoundError("Deck not found");
  return deck;
}

export async function getDeckForUser(userId: string, deckId: string): Promise<DeckDetailResponse> {
  const deck = await loadOwnedDeck(userId, deckId);
  const entries = await db.select().from(deckCards).where(eq(deckCards.deckId, deckId));

  const codes = entries.map((e) => e.cardCode);
  const cardRows = codes.length
    ? await db.select().from(cards).where(inArray(cards.code, codes))
    : [];
  const cardLookup = new Map(cardRows.map((row) => [row.code, toCard(row)]));

  const deckCardEntries: DeckCardEntry[] = entries.map((e) => ({ cardCode: e.cardCode, count: e.count }));
  const legality = checkLegality(
    deck.format as DeckFormat,
    deck.factionCode,
    deck.agendaCode,
    deckCardEntries,
    cardLookup
  );

  return {
    id: deck.id,
    userId: deck.userId,
    name: deck.name,
    factionCode: deck.factionCode,
    agendaCode: deck.agendaCode,
    format: deck.format as DeckFormat,
    cards: deckCardEntries,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
    legality,
  };
}

export async function updateDeck(
  userId: string,
  deckId: string,
  patch: { name?: string; agendaCode?: string | null }
) {
  await loadOwnedDeck(userId, deckId);
  await db
    .update(decks)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(decks.id, deckId));
}

export async function deleteDeck(userId: string, deckId: string) {
  await loadOwnedDeck(userId, deckId);
  await db.delete(decks).where(eq(decks.id, deckId));
}

export async function setDeckCard(userId: string, deckId: string, cardCode: string, count: number) {
  await loadOwnedDeck(userId, deckId);

  const [card] = await db.select().from(cards).where(eq(cards.code, cardCode)).limit(1);
  if (!card) throw new NotFoundError("Card not found");

  if (count <= 0) {
    await db.delete(deckCards).where(and(eq(deckCards.deckId, deckId), eq(deckCards.cardCode, cardCode)));
  } else {
    await db
      .insert(deckCards)
      .values({ deckId, cardCode, count })
      .onConflictDoUpdate({
        target: [deckCards.deckId, deckCards.cardCode],
        set: { count },
      });
  }

  await db.update(decks).set({ updatedAt: new Date() }).where(eq(decks.id, deckId));
}
