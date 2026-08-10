import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { CardTypeCode } from "@thronesdb/shared";
import { useCardSearch } from "../hooks/useCardSearch.js";
import { useFactions } from "../hooks/useFactions.js";
import { useTraits } from "../hooks/useTraits.js";
import { usePacks } from "../hooks/usePacks.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { CardSearchSidebar } from "../components/cards/CardSearchSidebar.js";
import { CardGrid } from "../components/cards/CardGrid.js";
import { CompareTray } from "../components/cards/CompareTray.js";

const PAGE_SIZE = 40;
const ICON_KEYS = ["unique", "loyal", "military", "intrigue", "power"] as const;

export function CardsSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [compare, setCompare] = useState<string[]>([]);

  const query = searchParams.get("q") ?? "";
  const activeFactions = useMemo(
    () => (searchParams.get("faction")?.split(",").filter(Boolean) ?? []),
    [searchParams]
  );
  const activeTypes = useMemo(
    () => (searchParams.get("type")?.split(",").filter(Boolean) as CardTypeCode[]) ?? [],
    [searchParams]
  );
  const activeTraits = useMemo(
    () => (searchParams.get("traits")?.split(",").filter(Boolean) ?? []),
    [searchParams]
  );
  const activePacks = useMemo(
    () => (searchParams.get("packs")?.split(",").filter(Boolean) ?? []),
    [searchParams]
  );
  const activeIcons = useMemo(
    () => ICON_KEYS.filter((k) => searchParams.get(k) === "1"),
    [searchParams]
  );
  const costMin = searchParams.has("costMin") ? Number(searchParams.get("costMin")) : undefined;
  const costMax = searchParams.has("costMax") ? Number(searchParams.get("costMax")) : undefined;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const debouncedQuery = useDebouncedValue(query, 200);

  const factionsQuery = useFactions();
  const traitsQuery = useTraits();
  const packsQuery = usePacks();
  const searchQuery = useCardSearch({
    q: debouncedQuery || undefined,
    faction: activeFactions.length ? activeFactions : undefined,
    type: activeTypes.length ? activeTypes : undefined,
    traits: activeTraits.length ? activeTraits : undefined,
    packCode: activePacks.length ? activePacks : undefined,
    unique: activeIcons.includes("unique") || undefined,
    loyal: activeIcons.includes("loyal") || undefined,
    military: activeIcons.includes("military") || undefined,
    intrigue: activeIcons.includes("intrigue") || undefined,
    power: activeIcons.includes("power") || undefined,
    costMin,
    costMax,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  function updateParams(next: {
    q?: string;
    faction?: string[];
    type?: CardTypeCode[];
    traits?: string[];
    packs?: string[];
    icons?: string[];
    costMin?: number;
    costMax?: number;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams);
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.faction !== undefined) {
      if (next.faction.length) params.set("faction", next.faction.join(","));
      else params.delete("faction");
    }
    if (next.type !== undefined) {
      if (next.type.length) params.set("type", next.type.join(","));
      else params.delete("type");
    }
    if (next.traits !== undefined) {
      if (next.traits.length) params.set("traits", next.traits.join(","));
      else params.delete("traits");
    }
    if (next.packs !== undefined) {
      if (next.packs.length) params.set("packs", next.packs.join(","));
      else params.delete("packs");
    }
    if (next.icons !== undefined) {
      for (const key of ICON_KEYS) {
        if (next.icons.includes(key)) params.set(key, "1");
        else params.delete(key);
      }
    }
    if ("costMin" in next) {
      if (next.costMin !== undefined) params.set("costMin", String(next.costMin));
      else params.delete("costMin");
    }
    if ("costMax" in next) {
      if (next.costMax !== undefined) params.set("costMax", String(next.costMax));
      else params.delete("costMax");
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }
    // Any change to filters or search text invalidates the current page.
    if (
      next.q !== undefined ||
      next.faction !== undefined ||
      next.type !== undefined ||
      next.traits !== undefined ||
      next.packs !== undefined ||
      next.icons !== undefined ||
      "costMin" in next ||
      "costMax" in next
    ) {
      params.delete("page");
    }
    setSearchParams(params, { replace: true });
  }

  function toggleFaction(code: string) {
    const has = activeFactions.includes(code);
    updateParams({ faction: has ? activeFactions.filter((f) => f !== code) : [...activeFactions, code] });
  }

  function toggleType(code: CardTypeCode) {
    const has = activeTypes.includes(code);
    updateParams({ type: has ? activeTypes.filter((t) => t !== code) : [...activeTypes, code] });
  }

  function toggleTrait(trait: string) {
    const has = activeTraits.includes(trait);
    updateParams({ traits: has ? activeTraits.filter((t) => t !== trait) : [...activeTraits, trait] });
  }

  function togglePack(code: string) {
    const has = activePacks.includes(code);
    updateParams({ packs: has ? activePacks.filter((p) => p !== code) : [...activePacks, code] });
  }

  function toggleIcon(key: string) {
    const has = activeIcons.includes(key as (typeof ICON_KEYS)[number]);
    updateParams({ icons: has ? activeIcons.filter((i) => i !== key) : [...activeIcons, key] });
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, page * PAGE_SIZE);

  useEffect(() => {
    if (!searchQuery.isLoading && page > totalPages) {
      updateParams({ page: totalPages });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery.isLoading, page, totalPages]);

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-7 py-6">
      <CardSearchSidebar
        query={query}
        onQueryChange={(q) => updateParams({ q })}
        factions={factionsQuery.data?.items ?? []}
        activeFactions={activeFactions}
        onToggleFaction={toggleFaction}
        activeTypes={activeTypes}
        onToggleType={toggleType}
        costMin={costMin}
        costMax={costMax}
        onCostChange={updateParams}
        traits={traitsQuery.data?.items ?? []}
        activeTraits={activeTraits}
        onToggleTrait={toggleTrait}
        packs={packsQuery.data?.items ?? []}
        activePacks={activePacks}
        onTogglePack={togglePack}
        activeIcons={activeIcons}
        onToggleIcon={toggleIcon}
        onClearFilters={clearFilters}
      />

      <div className="flex-1">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-[13px] text-accent">
            {searchQuery.isLoading
              ? "Loading…"
              : total === 0
                ? "0 cards"
                : `Showing ${rangeStart}–${rangeEnd} of ${total} cards`}
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

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3 text-[13px]">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateParams({ page: page - 1 })}
              className="rounded-sm border border-border px-3 py-1.5 text-textMuted disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>
            <div className="text-textMuted">
              Page {page} of {totalPages}
            </div>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: page + 1 })}
              className="rounded-sm border border-border px-3 py-1.5 text-textMuted disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}

        <div className="mt-4 text-xs text-textMuted">
          Rulings for a card? Check the Reviews section.
        </div>

        <CompareTray cards={compareCards} />
      </div>
    </div>
  );
}
