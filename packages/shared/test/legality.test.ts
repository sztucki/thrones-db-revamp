import { describe, expect, it } from "vitest";
import type { Card, DeckCardEntry } from "../src/types.js";
import { checkLegality } from "../src/legality.js";

function makeCard(overrides: Partial<Card> & { code: string; name: string }): Card {
  return {
    typeCode: "character",
    factionCode: "neutral",
    cost: 1,
    costRaw: "1",
    income: null,
    initiative: null,
    claim: null,
    reserve: null,
    text: "",
    traitsRaw: "",
    traits: [],
    isLoyal: false,
    isUnique: false,
    isMilitary: false,
    isIntrigue: false,
    isPower: false,
    strength: 1,
    deckLimit: 3,
    quantityInPack: 3,
    packCode: "Core",
    illustrator: null,
    flavor: null,
    octgnId: null,
    position: 0,
    imageUrl: null,
    createdAt: "2020-01-01T00:00:00Z",
    updatedAt: "2020-01-01T00:00:00Z",
    ...overrides,
  };
}

const NEUTRAL = makeCard({ code: "N001", name: "Neutral Filler", factionCode: "neutral" });
const STARK_LOYAL = makeCard({ code: "S001", name: "Stark Loyal Guy", factionCode: "stark", isLoyal: true });
const LANNISTER_LOYAL = makeCard({
  code: "L001",
  name: "Lannister Loyal Guy",
  factionCode: "lannister",
  isLoyal: true,
});
const PLOT = (code: string, name: string) => makeCard({ code, name, typeCode: "plot" });

function fillDraw(count: number, lookup: Map<string, Card>): DeckCardEntry[] {
  const entries: DeckCardEntry[] = [];
  let remaining = count;
  let i = 0;
  while (remaining > 0) {
    const take = Math.min(3, remaining);
    const code = `FILL${i}`;
    lookup.set(code, makeCard({ code, name: `Filler ${i}` }));
    entries.push({ cardCode: code, count: take });
    remaining -= take;
    i += 1;
  }
  return entries;
}

function buildLookup(cards: Card[]) {
  return new Map(cards.map((c) => [c.code, c]));
}

describe("checkLegality", () => {
  it("flags too few draw cards", () => {
    const lookup = buildLookup([NEUTRAL]);
    const cards: DeckCardEntry[] = [{ cardCode: NEUTRAL.code, count: 3 }];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.legal).toBe(false);
    expect(result.errors.some((e) => e.includes("Too few draw cards"))).toBe(true);
  });

  it("flags wrong plot count", () => {
    const plotFixtures = Array.from({ length: 6 }, (_, i) => PLOT(`P00${i}`, `Plot ${i}`));
    const lookup = buildLookup([NEUTRAL, ...plotFixtures]);
    const cards: DeckCardEntry[] = [
      { cardCode: NEUTRAL.code, count: 60 },
      ...plotFixtures.map((p) => ({ cardCode: p.code, count: 1 })),
    ];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.legal).toBe(false);
    expect(result.errors.some((e) => e.includes("Too few plot cards"))).toBe(true);
  });

  it("passes a legal minimal deck", () => {
    const plotFixtures = Array.from({ length: 7 }, (_, i) => PLOT(`P00${i}`, `Plot ${i}`));
    const lookup = buildLookup([NEUTRAL, ...plotFixtures]);
    const cards: DeckCardEntry[] = [
      { cardCode: NEUTRAL.code, count: 3 },
      ...plotFixtures.map((p) => ({ cardCode: p.code, count: 1 })),
    ];
    // top up neutral filler to 60 via a distinct code so deckLimit(3) isn't tripped
    const filler = Array.from({ length: 19 }, (_, i) => makeCard({ code: `F${i}`, name: `Filler ${i}` }));
    for (const f of filler) lookup.set(f.code, f);
    cards.push(...filler.map((f) => ({ cardCode: f.code, count: 3 })));

    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.drawCount).toBe(60);
    expect(result.plotCount).toBe(7);
    expect(result.legal).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects a loyal card from a different faction", () => {
    const lookup = buildLookup([NEUTRAL, LANNISTER_LOYAL]);
    const cards: DeckCardEntry[] = [...fillDraw(59, lookup), { cardCode: LANNISTER_LOYAL.code, count: 1 }];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.legal).toBe(false);
    expect(result.errors.some((e) => e.includes("not allowed by faction or agenda"))).toBe(true);
  });

  it("allows a loyal card matching the deck's own faction", () => {
    const lookup = buildLookup([NEUTRAL, STARK_LOYAL]);
    const cards: DeckCardEntry[] = [...fillDraw(59, lookup), { cardCode: STARK_LOYAL.code, count: 1 }];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.errors.some((e) => e.includes("not allowed by faction or agenda"))).toBe(false);
  });

  it("enforces per-card deck_limit", () => {
    const limited = makeCard({ code: "LIM1", name: "Limited Card", deckLimit: 2 });
    const lookup = buildLookup([NEUTRAL, limited]);
    const cards: DeckCardEntry[] = [...fillDraw(57, lookup), { cardCode: limited.code, count: 3 }];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.errors.some((e) => e.includes("Limited Card has limit 2"))).toBe(true);
  });

  it("enforces a Banner agenda's in-faction minimum", () => {
    // Banner of the Lion (01200): may include non-loyal Lannister cards, requires 12+
    const lannisterCard = makeCard({ code: "LAN1", name: "Lannister Filler", factionCode: "lannister" });
    const lookup = buildLookup([NEUTRAL, lannisterCard]);
    const cards: DeckCardEntry[] = [...fillDraw(48, lookup), { cardCode: lannisterCard.code, count: 3 }];
    const result = checkLegality("joust", "stark", "01200", cards, lookup);
    expect(result.errors.some((e) => e.includes("Must contain 12 or more Lannister cards"))).toBe(true);
  });

  it("flags a banned card from the current restricted list", () => {
    const banned = makeCard({ code: "01119", name: "Banned Fixture" });
    const lookup = buildLookup([NEUTRAL, banned]);
    const cards: DeckCardEntry[] = [...fillDraw(57, lookup), { cardCode: banned.code, count: 3 }];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.errors.some((e) => e.includes("not tournament legal"))).toBe(true);
  });

  it("flags more than one restricted-list card", () => {
    const restrictedA = makeCard({ code: "01146", name: "Restricted A" });
    const restrictedB = makeCard({ code: "01162", name: "Restricted B" });
    const lookup = buildLookup([NEUTRAL, restrictedA, restrictedB]);
    const cards: DeckCardEntry[] = [
      ...fillDraw(57, lookup),
      { cardCode: restrictedA.code, count: 1 },
      { cardCode: restrictedB.code, count: 1 },
      { cardCode: NEUTRAL.code, count: 1 },
    ];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.errors.some((e) => e.includes("more than 1 card on the restricted list"))).toBe(true);
  });

  it("warns and skips unknown card codes instead of throwing", () => {
    const lookup = buildLookup([NEUTRAL]);
    const cards: DeckCardEntry[] = [...fillDraw(59, lookup), { cardCode: "does-not-exist", count: 1 }];
    const result = checkLegality("joust", "stark", null, cards, lookup);
    expect(result.warnings.some((w) => w.includes("does-not-exist"))).toBe(true);
  });
});
