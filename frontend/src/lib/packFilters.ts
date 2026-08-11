export const VARIANTS_CYCLE_CODE = "variants";

/**
 * Packs never filter by default — but the "Variants" cycle (draft sets, house-rule
 * packs) must be opt-in, so unlike other filters, this always returns an explicit
 * codes list rather than `undefined` for "no filter".
 */
export function resolvePackCodeFilter(
  allPacks: { code: string; cycleCode: string }[],
  activeSetPacks: string[],
  activeVariantPacks: string[]
): string[] {
  const mainlineCodes = allPacks.filter((p) => p.cycleCode !== VARIANTS_CYCLE_CODE).map((p) => p.code);
  const setCodes = activeSetPacks.length ? activeSetPacks : mainlineCodes;
  return [...setCodes, ...activeVariantPacks];
}
