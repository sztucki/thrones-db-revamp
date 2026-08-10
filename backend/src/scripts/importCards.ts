// Imports AGoT 2e card/pack/cycle data from throneteki-json-data (the
// maintained successor to the archived ThronesDB/thronesdb-json-data repo —
// see the plan doc for why) and, per card, looks up image_url from
// ThronesDB's public API since the data repo doesn't carry card art.
//
// Usage: tsx src/scripts/importCards.ts [--packs=Core,AtG] [--skip-images] [--concurrency=10]
import { Ajv } from "ajv";
import { sql } from "drizzle-orm";
import { db, pool } from "../db/client.js";
import { cards, cycles, factions, importRuns, packs, types } from "../db/schema.js";
import { config } from "../config.js";

const REPO = config.CARD_DATA_REPO_URL;
const THRONESDB_API = config.THRONESDB_PUBLIC_API_URL;

interface Cycle {
  id: string;
  name: string;
  packs: string[];
}

interface RawCard {
  code: string;
  type: string;
  name: string;
  octgnId?: string | null;
  quantity: number;
  unique?: boolean;
  loyal?: boolean;
  faction: string;
  cost?: number | "X" | "-";
  icons?: { military: boolean; intrigue: boolean; power: boolean };
  strength?: number | "X" | "-";
  traits: string[];
  text: string;
  flavor?: string;
  deckLimit: number;
  illustrator?: string;
  designer?: string;
  plotStats?: {
    income: number | "X" | "-";
    initiative: number | "X" | "-";
    claim: number | "X" | "-";
    reserve: number | "X" | "-";
  };
}

interface RawPack {
  cgdbId?: number;
  code: string;
  name: string;
  releaseDate: string | null;
  cards: RawCard[];
}

const FACTION_NAMES: Record<string, string> = {
  baratheon: "Baratheon",
  greyjoy: "Greyjoy",
  lannister: "Lannister",
  martell: "Martell",
  neutral: "Neutral",
  stark: "Stark",
  targaryen: "Targaryen",
  thenightswatch: "Night's Watch",
  tyrell: "Tyrell",
};

const TYPE_NAMES: Record<string, string> = {
  agenda: "Agenda",
  attachment: "Attachment",
  character: "Character",
  event: "Event",
  location: "Location",
  plot: "Plot",
  title: "Title",
};

function toIntOrNull(v: number | "X" | "-" | undefined): { value: number | null; raw: string | null } {
  if (v === undefined) return { value: null, raw: null };
  if (typeof v === "number") return { value: v, raw: null };
  return { value: null, raw: v };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  return res.json() as Promise<T>;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function lookupImageUrl(code: string): Promise<string | null> {
  try {
    const data = await fetchJson<{ image_url?: string }>(`${THRONESDB_API}/card/${code}`);
    return data.image_url ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const packsFilterArg = args.find((a) => a.startsWith("--packs="));
  const packsFilter = packsFilterArg ? packsFilterArg.split("=")[1].split(",") : null;
  const skipImages = args.includes("--skip-images");
  const concurrencyArg = args.find((a) => a.startsWith("--concurrency="));
  const concurrency = concurrencyArg ? Number(concurrencyArg.split("=")[1]) : 10;

  const ajv = new Ajv({ strict: false, allErrors: true });
  const [cardSchema, packSchema] = await Promise.all([
    fetchJson(`${REPO}/card.schema.json`),
    fetchJson(`${REPO}/pack.schema.json`),
  ]);
  // pack.schema.json $refs "card.schema.json" by that literal id, so register
  // the card schema under that id before compiling the pack schema.
  ajv.addSchema(cardSchema as object, "card.schema.json");
  const validateCard = ajv.getSchema("card.schema.json")!;
  const validatePack = ajv.compile(packSchema as object);

  console.log("Seeding factions and types...");
  await db
    .insert(factions)
    .values(Object.entries(FACTION_NAMES).map(([code, name]) => ({ code, name, isPrimary: code !== "neutral" })))
    .onConflictDoUpdate({ target: factions.code, set: { name: sql`excluded.name` } });
  await db
    .insert(types)
    .values(Object.entries(TYPE_NAMES).map(([code, name]) => ({ code, name })))
    .onConflictDoUpdate({ target: types.code, set: { name: sql`excluded.name` } });

  console.log("Fetching cycles.json...");
  const cycleList = await fetchJson<Cycle[]>(`${REPO}/cycles.json`);
  await db
    .insert(cycles)
    .values(cycleList.map((c, i) => ({ code: c.id, name: c.name, position: i })))
    .onConflictDoUpdate({ target: cycles.code, set: { name: sql`excluded.name`, position: sql`excluded.position` } });

  const packToCycle = new Map<string, string>();
  const packPosition = new Map<string, number>();
  for (const cycle of cycleList) {
    cycle.packs.forEach((packCode, i) => {
      packToCycle.set(packCode, cycle.id);
      packPosition.set(packCode, i);
    });
  }

  let packCodes = [...packToCycle.keys()];
  if (packsFilter) {
    packCodes = packCodes.filter((c) => packsFilter.includes(c));
  }
  console.log(`Importing ${packCodes.length} pack(s)...`);

  let inserted = 0;
  // Upserts don't cheaply distinguish insert vs. update; all upserted rows
  // are counted via `inserted`, this stays 0 for the audit row.
  const updated = 0;
  let skipped = 0;

  for (const packCode of packCodes) {
    let raw: RawPack;
    try {
      raw = await fetchJson<RawPack>(`${REPO}/packs/${packCode}.json`);
    } catch (err) {
      console.warn(`  ! skipping pack ${packCode}: ${(err as Error).message}`);
      skipped++;
      continue;
    }
    if (!validatePack(raw)) {
      console.warn(`  ! pack ${packCode} failed schema validation:`, validatePack.errors);
      skipped++;
      continue;
    }

    await db
      .insert(packs)
      .values({
        code: raw.code,
        name: raw.name,
        cycleCode: packToCycle.get(packCode) ?? "core",
        position: packPosition.get(packCode) ?? 0,
        size: raw.cards.length,
        dateRelease: raw.releaseDate,
      })
      .onConflictDoUpdate({
        target: packs.code,
        set: {
          name: sql`excluded.name`,
          cycleCode: sql`excluded.cycle_code`,
          position: sql`excluded.position`,
          size: sql`excluded.size`,
          dateRelease: sql`excluded.date_release`,
        },
      });

    const validCards = raw.cards.filter((card) => {
      const ok = validateCard(card);
      if (!ok) {
        const c = card as RawCard;
        console.warn(`  ! card ${c.code} (${c.name}) failed schema validation:`, validateCard.errors);
      }
      return ok;
    });
    skipped += raw.cards.length - validCards.length;

    const imageUrls = skipImages
      ? validCards.map(() => null)
      : await mapWithConcurrency(validCards, concurrency, (c) => lookupImageUrl(c.code));

    for (let i = 0; i < validCards.length; i++) {
      const c = validCards[i];
      const costParsed = toIntOrNull(c.cost);
      const traitsRaw = c.traits.join(". ") + (c.traits.length ? "." : "");
      await db
        .insert(cards)
        .values({
          code: c.code,
          name: c.name,
          typeCode: c.type,
          factionCode: c.faction,
          cost: costParsed.value,
          costRaw: costParsed.raw,
          income: toIntOrNull(c.plotStats?.income).value,
          initiative: toIntOrNull(c.plotStats?.initiative).value,
          claim: toIntOrNull(c.plotStats?.claim).value,
          reserve: toIntOrNull(c.plotStats?.reserve).value,
          text: c.text ?? "",
          traitsRaw,
          traits: c.traits,
          isLoyal: c.loyal ?? false,
          isUnique: c.unique ?? false,
          isMilitary: c.icons?.military ?? false,
          isIntrigue: c.icons?.intrigue ?? false,
          isPower: c.icons?.power ?? false,
          strength: toIntOrNull(c.strength).value,
          deckLimit: c.deckLimit,
          quantityInPack: c.quantity,
          packCode: raw.code,
          illustrator: c.illustrator ?? null,
          flavor: c.flavor ?? null,
          octgnId: c.octgnId ?? null,
          position: i,
          imageUrl: imageUrls[i],
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: cards.code,
          set: {
            name: sql`excluded.name`,
            typeCode: sql`excluded.type_code`,
            factionCode: sql`excluded.faction_code`,
            cost: sql`excluded.cost`,
            costRaw: sql`excluded.cost_raw`,
            income: sql`excluded.income`,
            initiative: sql`excluded.initiative`,
            claim: sql`excluded.claim`,
            reserve: sql`excluded.reserve`,
            text: sql`excluded.text`,
            traitsRaw: sql`excluded.traits_raw`,
            traits: sql`excluded.traits`,
            isLoyal: sql`excluded.is_loyal`,
            isUnique: sql`excluded.is_unique`,
            isMilitary: sql`excluded.is_military`,
            isIntrigue: sql`excluded.is_intrigue`,
            isPower: sql`excluded.is_power`,
            strength: sql`excluded.strength`,
            deckLimit: sql`excluded.deck_limit`,
            quantityInPack: sql`excluded.quantity_in_pack`,
            packCode: sql`excluded.pack_code`,
            illustrator: sql`excluded.illustrator`,
            flavor: sql`excluded.flavor`,
            octgnId: sql`excluded.octgn_id`,
            position: sql`excluded.position`,
            imageUrl: sql`coalesce(excluded.image_url, ${cards.imageUrl})`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
      inserted++;
    }
    console.log(`  ✓ ${packCode}: ${validCards.length} cards`);
  }

  await db.insert(importRuns).values({
    id: crypto.randomUUID(),
    packCodes,
    cardsInserted: inserted,
    cardsUpdated: updated,
    cardsSkipped: skipped,
  });

  console.log(`\nDone. Upserted ${inserted} card rows, skipped ${skipped}.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
