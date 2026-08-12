import type { CardTypeCode } from "@thronesdb/shared";
import { useCardSearch } from "./useCardSearch.js";
import { splitTypeFilter } from "../lib/cardTypes.js";

export interface CardBrowseFilters {
  q?: string;
  faction?: string[];
  traits?: string[];
  packCode?: string[];
  icons: string[];
  costMin?: number;
  costMax?: number;
  sortDir?: "asc" | "desc";
}

export interface CardBrowsePaging {
  page: number;
  plotPage: number;
  pageSize: number;
  plotPageSize: number;
}

/** Shared by the cards-search page and the deck-builder's card browser: both
 * split a "main" (non-plot) query from an independently-paginated plot query
 * built from the same filter set. */
export function useCardBrowseQueries(
  filters: CardBrowseFilters,
  activeTypes: CardTypeCode[],
  paging: CardBrowsePaging,
  enabledBase: boolean
) {
  const { mainTypes, showPlots } = splitTypeFilter(activeTypes);

  const sharedFilters = {
    q: filters.q,
    faction: filters.faction,
    traits: filters.traits,
    packCode: filters.packCode,
    unique: filters.icons.includes("unique") || undefined,
    loyal: filters.icons.includes("loyal") || undefined,
    military: filters.icons.includes("military") || undefined,
    intrigue: filters.icons.includes("intrigue") || undefined,
    power: filters.icons.includes("power") || undefined,
    costMin: filters.costMin,
    costMax: filters.costMax,
    sortDir: filters.sortDir,
  };

  const searchQuery = useCardSearch(
    {
      ...sharedFilters,
      type: mainTypes,
      limit: paging.pageSize,
      offset: (paging.page - 1) * paging.pageSize,
    },
    { enabled: mainTypes.length > 0 && enabledBase }
  );

  const plotQuery = useCardSearch(
    {
      ...sharedFilters,
      type: ["plot"],
      limit: paging.plotPageSize,
      offset: (paging.plotPage - 1) * paging.plotPageSize,
    },
    { enabled: showPlots && enabledBase }
  );

  return { mainTypes, showPlots, searchQuery, plotQuery };
}
