import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type {
  Card,
  CardTypeCode,
  DeckCardEntry,
  DeckDetailResponse,
  DeckFormat,
  DeckListResult,
} from "@thronesdb/shared";
import { checkLegality, checkTournamentLegality } from "@thronesdb/shared";
import { db } from "../db/client.js";
import { cards, deckCards, decks } from "../db/schema.js";

export class NotFoundError extends Error {}

const DEFAULT_DECK_LIMIT = 20;
const MAX_DECK_LIMIT = 100;

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

export async function listDecksForUser(
  userId: string,
  params: { limit?: number; offset?: number } = {}
): Promise<DeckListResult> {
  const limit = Math.min(params.limit ?? DEFAULT_DECK_LIMIT, MAX_DECK_LIMIT);
  const offset = params.offset ?? 0;

  const [deckRows, totalRow] = await Promise.all([
    db
      .select()
      .from(decks)
      .where(eq(decks.userId, userId))
      .orderBy(desc(decks.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(decks).where(eq(decks.userId, userId)),
  ]);

  const deckIds = deckRows.map((d) => d.id);
  const entries = deckIds.length
    ? await db.select().from(deckCards).where(inArray(deckCards.deckId, deckIds))
    : [];

  const cardCodes = [...new Set(entries.map((e) => e.cardCode))];
  const cardRows = cardCodes.length
    ? await db.select().from(cards).where(inArray(cards.code, cardCodes))
    : [];
  const cardLookup = new Map(cardRows.map((row) => [row.code, toCard(row)]));

  const entriesByDeck = new Map<string, DeckCardEntry[]>();
  for (const e of entries) {
    const list = entriesByDeck.get(e.deckId) ?? [];
    list.push({ cardCode: e.cardCode, count: e.count });
    entriesByDeck.set(e.deckId, list);
  }

  const items = deckRows.map((deck) => {
    const deckEntries = entriesByDeck.get(deck.id) ?? [];
    const cardCount = deckEntries.reduce((sum, e) => sum + e.count, 0);
    const legality = checkLegality(
      deck.format as DeckFormat,
      deck.factionCode,
      deck.agendaCode,
      deckEntries,
      cardLookup
    );
    const tournamentLegality = checkTournamentLegality(deck.factionCode, deck.agendaCode, deckEntries, cardLookup);
    return {
      id: deck.id,
      name: deck.name,
      factionCode: deck.factionCode,
      agendaCode: deck.agendaCode,
      format: deck.format as DeckFormat,
      cardCount,
      updatedAt: deck.updatedAt.toISOString(),
      legal: legality.legal,
      drawCount: legality.drawCount,
      requiredDraw: legality.requiredDraw,
      tournamentLegality,
    };
  });

  return { items, total: totalRow[0]?.count ?? 0 };
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
  const tournamentLegality = checkTournamentLegality(deck.factionCode, deck.agendaCode, deckCardEntries, cardLookup);

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
    tournamentLegality,
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
