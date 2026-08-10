import type { Card } from "../types.js";

// Ported from throneteki/throneteki-deck-helper's AgendaRules.js (the
// reference deck-validation engine maintained by the same project as our
// card data source), translated to this project's Card field names
// (card.faction -> factionCode, card.loyal -> isLoyal, card.type ->
// typeCode, card.deckLimit unchanged). Keyed by agenda card code.
export interface AgendaRuleCondition {
  message: string;
  condition: (draw: DeckCardCount[], plots: DeckCardCount[]) => boolean;
}

export interface DeckCardCount {
  card: Card;
  count: number;
}

export interface AgendaRule {
  mayInclude?: (card: Card) => boolean;
  cannotInclude?: (card: Card) => boolean;
  requiredDraw?: number;
  requiredPlots?: number;
  maxDoubledPlots?: number;
  rules?: AgendaRuleCondition[];
}

function hasTrait(card: Card, trait: string) {
  return card.traits.some((t) => t.toLowerCase() === trait.toLowerCase());
}

function countDraw(draw: DeckCardCount[], predicate: (c: Card) => boolean) {
  return draw.filter((d) => predicate(d.card)).reduce((sum, d) => sum + d.count, 0);
}

function rulesForBanner(faction: string, factionName: string): AgendaRule {
  return {
    mayInclude: (card) => card.factionCode === faction && !card.isLoyal && card.typeCode !== "plot",
    rules: [
      {
        message: `Must contain 12 or more ${factionName} cards`,
        condition: (draw) => countDraw(draw, (c) => c.factionCode === faction) >= 12,
      },
    ],
  };
}

export const AGENDA_RULES: Record<string, AgendaRule> = {
  "01198": rulesForBanner("baratheon", "Baratheon"),
  "01199": rulesForBanner("greyjoy", "Greyjoy"),
  "01200": rulesForBanner("lannister", "Lannister"),
  "01201": rulesForBanner("martell", "Martell"),
  "01202": rulesForBanner("thenightswatch", "Night's Watch"),
  "01203": rulesForBanner("stark", "Stark"),
  "01204": rulesForBanner("targaryen", "Targaryen"),
  "01205": rulesForBanner("tyrell", "Tyrell"),
  // Fealty
  "01027": {
    rules: [
      {
        message: "You cannot include more than 15 neutral cards in a deck with Fealty",
        condition: (draw) => countDraw(draw, (c) => c.factionCode === "neutral") <= 15,
      },
    ],
  },
  // Kings of Summer
  "04037": {
    cannotInclude: (card) => card.typeCode === "plot" && hasTrait(card, "Winter"),
    rules: [
      {
        message: "Kings of Summer cannot include Winter plot cards",
        condition: (_draw, plots) => !plots.some((p) => hasTrait(p.card, "Winter")),
      },
    ],
  },
  // Kings of Winter
  "04038": {
    cannotInclude: (card) => card.typeCode === "plot" && hasTrait(card, "Summer"),
    rules: [
      {
        message: "Kings of Winter cannot include Summer plot cards",
        condition: (_draw, plots) => !plots.some((p) => hasTrait(p.card, "Summer")),
      },
    ],
  },
  // Rains of Castamere
  "05045": {
    requiredPlots: 12,
    rules: [
      {
        message: "Rains of Castamere must contain exactly 5 different Scheme plots",
        condition: (_draw, plots) => {
          const schemePlots = plots.filter((p) => hasTrait(p.card, "Scheme"));
          const total = schemePlots.reduce((sum, p) => sum + p.count, 0);
          return schemePlots.length === 5 && total === 5;
        },
      },
    ],
  },
  // The Brotherhood Without Banners
  "06119": {
    cannotInclude: (card) => card.typeCode === "character" && card.isLoyal,
    rules: [
      {
        message: "The Brotherhood Without Banners cannot include loyal characters",
        condition: (draw) => !draw.some((d) => d.card.typeCode === "character" && d.card.isLoyal),
      },
    ],
  },
  // The Conclave
  "09045": {
    mayInclude: (card) => card.typeCode === "character" && hasTrait(card, "Maester") && !card.isLoyal,
    rules: [
      {
        message: "Must contain 12 or more Maester characters",
        condition: (draw) => countDraw(draw, (c) => c.typeCode === "character" && hasTrait(c, "Maester")) >= 12,
      },
    ],
  },
  // The Wars To Come
  "10045": { requiredPlots: 10, maxDoubledPlots: 2 },
  // The Free Folk
  "11079": { cannotInclude: (card) => card.factionCode !== "neutral" },
  // Kingdom of Shadows
  "13079": { mayInclude: (card) => !card.isLoyal && /shadow \(\d+\)/i.test(card.text) },
  // The White Book
  "13099": {
    mayInclude: (card) => card.typeCode === "character" && hasTrait(card, "Kingsguard") && !card.isLoyal,
    rules: [
      {
        message: "Must contain 7 or more different Kingsguard characters",
        condition: (draw) =>
          draw.filter((d) => d.card.typeCode === "character" && hasTrait(d.card, "Kingsguard")).length >= 7,
      },
    ],
  },
  // Valyrian Steel
  "13118": {
    requiredDraw: 75,
    rules: [
      {
        message: "Cannot include more than 1 copy of each attachment (by title)",
        condition: (draw) => draw.filter((d) => d.card.typeCode === "attachment").every((d) => d.count <= 1),
      },
    ],
  },
  // Dark Wings, Dark Words
  "16028": {
    requiredDraw: 75,
    rules: [
      {
        message: "Cannot include more than 1 copy of each event (by title)",
        condition: (draw) => draw.filter((d) => d.card.typeCode === "event").every((d) => d.count <= 1),
      },
    ],
  },
  // The Long Voyage
  "16030": { requiredDraw: 100 },
  // Kingdom of Shadows (Redesign)
  "17148": { mayInclude: (card) => !card.isLoyal && /shadow \(\d+\)/i.test(card.text) },
  // Sea of Blood (Redesign)
  "17149": { cannotInclude: (card) => card.factionCode === "neutral" && card.typeCode === "event" },
  // The Free Folk (Redesign)
  "17150": {
    mayInclude: (card) =>
      card.factionCode !== "neutral" && card.typeCode === "character" && !card.isLoyal && hasTrait(card, "Wildling"),
    rules: [
      {
        message: "Must only contain neutral cards or Non-loyal Wildling characters",
        condition: (draw, plots) => {
          const drawValid = !draw.some(
            (d) =>
              d.card.factionCode !== "neutral" &&
              !(d.card.typeCode === "character" && !d.card.isLoyal && hasTrait(d.card, "Wildling"))
          );
          const plotValid = !plots.some((p) => p.card.factionCode !== "neutral");
          return drawValid && plotValid;
        },
      },
    ],
  },
  // The Wars To Come (Redesign)
  "17151": { requiredPlots: 10, maxDoubledPlots: 2 },
  // Valyrian Steel (Redesign)
  "17152": {
    requiredDraw: 75,
    rules: [
      {
        message: "Cannot include more than 1 copy of each attachment",
        condition: (draw) => draw.filter((d) => d.card.typeCode === "attachment").every((d) => d.count <= 1),
      },
    ],
  },
  // A Mummer's Farce
  "20051": { mayInclude: (card) => card.typeCode === "character" && hasTrait(card, "Fool") && !card.isLoyal },
  // The Many-Faced God
  "20052": { cannotInclude: (card) => card.typeCode === "plot" && hasTrait(card, "Kingdom") },
  // Battle of the Trident
  "21030": {
    requiredPlots: 10,
    rules: [
      {
        message: "Battle of the Trident must contain exactly 10 Edict, Siege or War plots",
        condition: (_draw, plots) =>
          plots.every((p) => hasTrait(p.card, "Edict") || hasTrait(p.card, "Siege") || hasTrait(p.card, "War")),
      },
    ],
  },
  // Banner of the Falcon
  "23040": {
    rules: [
      {
        message: "Must contain 12 or more House Arryn cards",
        condition: (draw) => countDraw(draw, (c) => hasTrait(c, "House Arryn")) >= 12,
      },
    ],
  },
};
