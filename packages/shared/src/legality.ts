import type { Card, DeckCardEntry, DeckFormat } from "./types.js";

/**
 * Real ruleset implementation lands in Phase 6 (requires researching current
 * AGoT 2e Tournament Regulations). This stub exists only so the package
 * compiles and downstream code can import stable types during earlier phases.
 */
export interface LegalityResult {
  format: DeckFormat;
  legal: boolean;
  warnings: string[];
}

export function checkLegality(
  _format: DeckFormat,
  _cards: DeckCardEntry[],
  _cardLookup: Map<string, Card>
): LegalityResult {
  throw new Error("checkLegality is not implemented yet — see Phase 6 of the plan.");
}
