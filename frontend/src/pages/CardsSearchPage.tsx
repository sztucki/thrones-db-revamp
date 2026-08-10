import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCardSearch } from "../hooks/useCardSearch.js";
import { useFactions } from "../hooks/useFactions.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { CardSearchSidebar } from "../components/cards/CardSearchSidebar.js";
import { CardGrid } from "../components/cards/CardGrid.js";
import { CompareTray } from "../components/cards/CompareTray.js";

const PAGE_SIZE = 40;

export function CardsSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [compare, setCompare] = useState<string[]>([]);

  const query = searchParams.get("q") ?? "";
  const activeFactions = useMemo(
    () => (searchParams.get("faction")?.split(",").filter(Boolean) ?? []),
    [searchParams]
  );
  const debouncedQuery = useDebouncedValue(query, 200);

  const factionsQuery = useFactions();
  const searchQuery = useCardSearch({
    q: debouncedQuery || undefined,
    faction: activeFactions.length ? activeFactions : undefined,
    limit: PAGE_SIZE,
  });

  function updateParams(next: { q?: string; faction?: string[] }) {
    const params = new URLSearchParams(searchParams);
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.faction !== undefined) {
      if (next.faction.length) params.set("faction", next.faction.join(","));
      else params.delete("faction");
    }
    setSearchParams(params, { replace: true });
  }

  function toggleFaction(code: string) {
    const has = activeFactions.includes(code);
    updateParams({ faction: has ? activeFactions.filter((f) => f !== code) : [...activeFactions, code] });
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  function toggleCompare(code: string) {
    setCompare((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  const items = searchQuery.data?.items ?? [];
  const total = searchQuery.data?.total ?? 0;
  const compareCards = items.filter((c) => compare.includes(c.code));

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-7 py-6">
      <CardSearchSidebar
        query={query}
        onQueryChange={(q) => updateParams({ q })}
        factions={factionsQuery.data?.items ?? []}
        activeFactions={activeFactions}
        onToggleFaction={toggleFaction}
        onClearFilters={clearFilters}
      />

      <div className="flex-1">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-[13px] text-accent">
            {searchQuery.isLoading ? "Loading…" : `${total} cards — updates live`}
          </div>
          <div className="text-[13px] text-textMuted">Sort: Name ▾</div>
        </div>

        {searchQuery.isError && (
          <div className="rounded border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
            Couldn't load cards. Is the backend running?
          </div>
        )}

        {!searchQuery.isError && items.length === 0 && !searchQuery.isLoading && (
          <div className="py-10 text-center text-sm text-textMuted">No cards match these filters.</div>
        )}

        <CardGrid cards={items} compare={compare} onToggleCompare={toggleCompare} />

        <div className="mt-4 text-xs text-textMuted">
          Rulings for a card? Check the Reviews section.
        </div>

        <CompareTray cards={compareCards} />
      </div>
    </div>
  );
}
