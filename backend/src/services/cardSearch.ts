import { and, asc, eq, gte, inArray, lte, sql, SQL } from "drizzle-orm";
import { db } from "../db/client.js";
import { cards } from "../db/schema.js";

export interface CardSearchParams {
  q?: string;
  faction?: string[];
  type?: string[];
  costMin?: number;
  costMax?: number;
  traits?: string[];
  packCode?: string[];
  unique?: boolean;
  loyal?: boolean;
  military?: boolean;
  intrigue?: boolean;
  power?: boolean;
  limit?: number;
  offset?: number;
}

const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;

export async function searchCards(params: CardSearchParams) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = params.offset ?? 0;

  const conditions: SQL[] = [];

  const q = params.q?.trim();
  if (q) {
    // Matches the expression backing cards_search_idx exactly, so this can
    // use the GIN index instead of a sequential scan.
    conditions.push(
      sql`to_tsvector('english', coalesce(${cards.name}, '') || ' ' || coalesce(${cards.text}, '')) @@ plainto_tsquery('english', ${q})`
    );
  }

  if (params.faction?.length) {
    conditions.push(inArray(cards.factionCode, params.faction));
  }

  if (params.type?.length) {
    conditions.push(inArray(cards.typeCode, params.type));
  }

  if (params.costMin !== undefined) {
    conditions.push(gte(cards.cost, params.costMin));
  }

  if (params.costMax !== undefined) {
    conditions.push(lte(cards.cost, params.costMax));
  }

  if (params.traits?.length) {
    const traitValues = sql.join(
      params.traits.map((t) => sql`${t}`),
      sql`, `
    );
    conditions.push(sql`${cards.traits} && ARRAY[${traitValues}]::text[]`);
  }

  if (params.packCode?.length) {
    conditions.push(inArray(cards.packCode, params.packCode));
  }

  if (params.unique) {
    conditions.push(eq(cards.isUnique, true));
  }

  if (params.loyal) {
    conditions.push(eq(cards.isLoyal, true));
  }

  if (params.military) {
    conditions.push(eq(cards.isMilitary, true));
  }

  if (params.intrigue) {
    conditions.push(eq(cards.isIntrigue, true));
  }

  if (params.power) {
    conditions.push(eq(cards.isPower, true));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [items, totalRow] = await Promise.all([
    db.select().from(cards).where(where).orderBy(asc(cards.name)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(cards).where(where),
  ]);

  return { items, total: totalRow[0]?.count ?? 0 };
}

export async function getCardByCode(code: string) {
  const [card] = await db.select().from(cards).where(eq(cards.code, code)).limit(1);
  return card ?? null;
}

export async function listTraits(): Promise<string[]> {
  const rows = await db.execute<{ trait: string }>(
    sql`select distinct trait from ${cards}, unnest(${cards.traits}) as trait order by trait`
  );
  return rows.rows.map((r) => r.trait);
}
