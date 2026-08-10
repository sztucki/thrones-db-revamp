import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { db, pool } from "../src/db/client.js";
import { cards, factions, packs, cycles, types } from "../src/db/schema.js";
import { getCardByCode, listTraits, searchCards } from "../src/services/cardSearch.js";

async function seed() {
  await db.insert(cycles).values({ code: "core", name: "Core Set", position: 0 }).onConflictDoNothing();
  await db.insert(packs).values({ code: "Core", name: "Core Set", cycleCode: "core", position: 0, size: 2, dateRelease: null }).onConflictDoNothing();
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
      { code: "location", name: "Location" },
    ])
    .onConflictDoNothing();
  await db
    .insert(cards)
    .values([
      {
        code: "TEST01",
        name: "Eddard Stark",
        typeCode: "character",
        factionCode: "stark",
        cost: 4,
        text: "A noble lord of the North.",
        traitsRaw: "Lord. Stark.",
        traits: ["Lord", "Stark", "QaMarkerLord"],
        deckLimit: 3,
        packCode: "Core",
        position: 1,
      },
      {
        code: "TEST02",
        name: "Winterfell",
        typeCode: "location",
        factionCode: "stark",
        cost: 3,
        text: "The seat of House Stark.",
        traitsRaw: "Stronghold.",
        traits: ["Stronghold", "QaMarkerStronghold"],
        deckLimit: 2,
        packCode: "Core",
        position: 2,
      },
    ])
    .onConflictDoNothing();
}

beforeAll(async () => {
  await seed();
});

afterAll(async () => {
  await db.delete(cards).where(sql`code in ('TEST01','TEST02')`);
  await pool.end();
});

describe("searchCards", () => {
  it("filters by full-text query against name and text", async () => {
    const result = await searchCards({ q: "Winterfell" });
    const codes = result.items.map((c) => c.code);
    expect(codes).toContain("TEST02");
    expect(codes).not.toContain("TEST01");
  });

  it("filters by faction and type together", async () => {
    const result = await searchCards({ faction: ["stark"], type: ["character"] });
    const codes = result.items.map((c) => c.code);
    expect(codes).toContain("TEST01");
    expect(codes).not.toContain("TEST02");
  });

  it("filters by cost range", async () => {
    const result = await searchCards({ faction: ["stark"], costMin: 4, costMax: 4 });
    const codes = result.items.map((c) => c.code);
    expect(codes).toContain("TEST01");
    expect(codes).not.toContain("TEST02");
  });

  it("filters by trait overlap", async () => {
    const result = await searchCards({ traits: ["QaMarkerStronghold"] });
    const codes = result.items.map((c) => c.code);
    expect(codes).toContain("TEST02");
    expect(codes).not.toContain("TEST01");
  });

  it("filters by cards matching any of several traits", async () => {
    const result = await searchCards({ traits: ["QaMarkerLord", "QaMarkerStronghold"] });
    const codes = result.items.map((c) => c.code);
    expect(codes).toContain("TEST01");
    expect(codes).toContain("TEST02");
  });

  it("reports total distinct from the page size", async () => {
    const result = await searchCards({ faction: ["stark"], limit: 1 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBeGreaterThanOrEqual(2);
  });
});

describe("getCardByCode", () => {
  it("returns null for an unknown code", async () => {
    expect(await getCardByCode("does-not-exist")).toBeNull();
  });

  it("returns the card for a known code", async () => {
    const card = await getCardByCode("TEST01");
    expect(card?.name).toBe("Eddard Stark");
  });
});

describe("listTraits", () => {
  it("returns distinct traits across all cards, sorted", async () => {
    const traits = await listTraits();
    expect(traits).toContain("Lord");
    expect(traits).toContain("Stark");
    expect(traits).toContain("Stronghold");
    expect(traits).toEqual([...traits].sort());
    expect(new Set(traits).size).toBe(traits.length);
  });
});
