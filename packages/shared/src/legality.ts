import type { Card, DeckCardEntry, DeckFormat } from "./types.js";
import { AGENDA_RULES, type DeckCardCount } from "./data/agendaRules.js";
import { CURRENT_RESTRICTED_LIST, RESTRICTED_LISTS, type RestrictedList } from "./data/restrictedList.js";

// Deck-building legality for AGoT 2e (Joust/Melee), ported from the reference
// engine at throneteki/throneteki-deck-helper (same maintainers as our card
// data source) rather than reverse-engineered from the prototype's
// placeholder card-count math. Base rules (60-card draw deck minimum,
// exactly 7 plots, deck_limit, faction/neutral/agenda restrictions) plus the
// currently active restricted/banned list (see data/restrictedList.ts) and a
// curated set of agenda-specific rules (see data/agendaRules.ts).
//
// Known scope cut: Alliance (agenda 06018), which lets a deck carry up to 2
// additional "banner" agendas, isn't representable because Deck only stores
// a single agendaCode — flagged as future work rather than modeled.
const BASE_REQUIRED_DRAW = 60;
const BASE_REQUIRED_PLOTS = 7;
const BASE_MAX_DOUBLED_PLOTS = 1;

export interface LegalityResult {
  format: DeckFormat;
  legal: boolean;
  errors: string[];
  warnings: string[];
  drawCount: number;
  plotCount: number;
  requiredDraw: number;
  requiredPlots: number;
}

interface BaseLegality {
  errors: string[];
  warnings: string[];
  drawCount: number;
  plotCount: number;
  requiredDraw: number;
  requiredPlots: number;
  resolved: DeckCardCount[];
}

function baseLegality(factionCode: string, agendaCode: string | null, cards: DeckCardEntry[], cardLookup: Map<string, Card>): BaseLegality {
  const errors: string[] = [];
  const warnings: string[] = [];

  const resolved: DeckCardCount[] = [];
  for (const entry of cards) {
    const card = cardLookup.get(entry.cardCode);
    if (!card) {
      warnings.push(`Unknown card code ${entry.cardCode} was skipped`);
      continue;
    }
    if (entry.count > 0) resolved.push({ card, count: entry.count });
  }

  const plotCards = resolved.filter((d) => d.card.typeCode === "plot");
  const drawCards = resolved.filter((d) => d.card.typeCode !== "plot");

  const agendaRule = agendaCode ? AGENDA_RULES[agendaCode] : undefined;
  const requiredDraw = agendaRule?.requiredDraw ?? BASE_REQUIRED_DRAW;
  const requiredPlots = agendaRule?.requiredPlots ?? BASE_REQUIRED_PLOTS;
  const maxDoubledPlots = agendaRule?.maxDoubledPlots ?? BASE_MAX_DOUBLED_PLOTS;

  const drawCount = drawCards.reduce((sum, d) => sum + d.count, 0);
  const plotCount = plotCards.reduce((sum, d) => sum + d.count, 0);

  if (drawCount < requiredDraw) errors.push(`Too few draw cards (${drawCount}/${requiredDraw})`);
  if (plotCount < requiredPlots) errors.push(`Too few plot cards (${plotCount}/${requiredPlots})`);
  else if (plotCount > requiredPlots) errors.push(`Too many plot cards (${plotCount}/${requiredPlots})`);

  function mayInclude(card: Card) {
    const inFaction = card.factionCode === factionCode || card.factionCode === "neutral";
    return inFaction || (agendaRule?.mayInclude?.(card) ?? false);
  }
  function cannotInclude(card: Card) {
    return agendaRule?.cannotInclude?.(card) ?? false;
  }

  for (const { card } of resolved) {
    if (!mayInclude(card) || cannotInclude(card)) {
      errors.push(`${card.name} is not allowed by faction or agenda`);
    }
  }

  const countByName = new Map<string, { count: number; limit: number; type: string }>();
  for (const { card, count } of resolved) {
    const existing = countByName.get(card.name);
    if (existing) existing.count += count;
    else countByName.set(card.name, { count, limit: card.deckLimit, type: card.typeCode });
  }
  for (const [name, info] of countByName) {
    if (info.count > info.limit) errors.push(`${name} has limit ${info.limit}`);
  }

  const doubledPlots = [...countByName.values()].filter((c) => c.type === "plot" && c.count === 2);
  if (doubledPlots.length > maxDoubledPlots) {
    errors.push(`Maximum allowed number of doubled plots: ${maxDoubledPlots}`);
  }

  for (const rule of agendaRule?.rules ?? []) {
    if (!rule.condition(drawCards, plotCards)) errors.push(rule.message);
  }

  return { errors, warnings, drawCount, plotCount, requiredDraw, requiredPlots, resolved };
}

function restrictedListErrors(
  list: RestrictedList,
  format: DeckFormat,
  resolved: DeckCardCount[],
  cardLookup: Map<string, Card>
): string[] {
  const errors: string[] = [];
  const restrictedFormat = list.formats.find((f) => f.name === format);
  if (!restrictedFormat) return errors;

  const uniqueCodes = new Set(resolved.map((d) => d.card.code));
  const restrictedOnList = [...uniqueCodes].filter((code) => restrictedFormat.restricted.includes(code));
  if (restrictedOnList.length > 1) {
    const names = restrictedOnList.map((code) => cardLookup.get(code)?.name ?? code).join(", ");
    errors.push(`${list.name}: Contains more than 1 card on the restricted list: ${names}`);
  }

  const bannedOnList = [...uniqueCodes].filter(
    (code) => restrictedFormat.banned.includes(code) || list.bannedCards.includes(code)
  );
  if (bannedOnList.length > 0) {
    const names = bannedOnList.map((code) => cardLookup.get(code)?.name ?? code).join(", ");
    errors.push(`${list.name}: Contains cards that are not tournament legal: ${names}`);
  }

  for (const pod of restrictedFormat.pods) {
    const onPod = [...uniqueCodes].filter((code) => pod.cards.includes(code));
    if (onPod.length > 1) {
      const names = onPod.map((code) => cardLookup.get(code)?.name ?? code).join(", ");
      errors.push(`${list.name}: ${names} cannot be used together`);
    }
  }

  return errors;
}

export function checkLegality(
  format: DeckFormat,
  factionCode: string,
  agendaCode: string | null,
  cards: DeckCardEntry[],
  cardLookup: Map<string, Card>
): LegalityResult {
  const base = baseLegality(factionCode, agendaCode, cards, cardLookup);
  const errors = [...base.errors, ...restrictedListErrors(CURRENT_RESTRICTED_LIST, format, base.resolved, cardLookup)];

  return {
    format,
    legal: errors.length === 0,
    errors,
    warnings: base.warnings,
    drawCount: base.drawCount,
    plotCount: base.plotCount,
    requiredDraw: base.requiredDraw,
    requiredPlots: base.requiredPlots,
  };
}

export interface TournamentLegalityCell {
  listCode: string;
  listName: string;
  format: DeckFormat;
  legal: boolean;
}

const TOURNAMENT_FORMATS: DeckFormat[] = ["joust", "melee"];

export function checkTournamentLegality(
  factionCode: string,
  agendaCode: string | null,
  cards: DeckCardEntry[],
  cardLookup: Map<string, Card>
): TournamentLegalityCell[] {
  const base = baseLegality(factionCode, agendaCode, cards, cardLookup);
  const cells: TournamentLegalityCell[] = [];
  for (const list of RESTRICTED_LISTS) {
    for (const format of TOURNAMENT_FORMATS) {
      const errors = restrictedListErrors(list, format, base.resolved, cardLookup);
      cells.push({
        listCode: list.code,
        listName: list.name,
        format,
        legal: base.errors.length === 0 && errors.length === 0,
      });
    }
  }
  return cells;
}
