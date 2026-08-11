import type { CardTypeCode } from "@thronesdb/shared";

export const TYPE_OPTIONS: { code: CardTypeCode; label: string }[] = [
  { code: "character", label: "Character" },
  { code: "location", label: "Location" },
  { code: "attachment", label: "Attachment" },
  { code: "event", label: "Event" },
  { code: "plot", label: "Plot" },
  { code: "agenda", label: "Agenda" },
  { code: "title", label: "Title" },
];

export const NON_PLOT_TYPES: CardTypeCode[] = TYPE_OPTIONS.map((t) => t.code).filter((c) => c !== "plot");

/**
 * Plots are landscape and get their own independently-paginated section, so a card
 * search screen needs its `type` filter split into a "main" (non-plot) query and a
 * "plots" query rather than one mixed, mixed-orientation page of results.
 */
export function splitTypeFilter(activeTypes: CardTypeCode[]): {
  mainTypes: CardTypeCode[];
  showPlots: boolean;
} {
  const mainTypes = activeTypes.length ? activeTypes.filter((t) => t !== "plot") : NON_PLOT_TYPES;
  const showPlots = activeTypes.length === 0 || activeTypes.includes("plot");
  return { mainTypes, showPlots };
}
