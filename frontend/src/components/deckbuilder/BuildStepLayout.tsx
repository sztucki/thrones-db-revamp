import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AGENDA_RULES, type Card, type CardTypeCode, type DeckDetailResponse } from "@thronesdb/shared";
import { useCardSearch } from "../../hooks/useCardSearch.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { useCardsByCode } from "../../hooks/useCardsByCode.js";
import { useFactions } from "../../hooks/useFactions.js";
import { useTraits } from "../../hooks/useTraits.js";
import { usePacks } from "../../hooks/usePacks.js";
import { useDeleteDeck, useSetDeckCard, useUpdateDeck } from "../../hooks/useDecks.js";
import { CardGrid } from "../cards/CardGrid.js";
import { CardSearchSidebar } from "../cards/CardSearchSidebar.js";
import { CardDetailModal } from "../cards/CardDetailModal.js";
import { Pagination } from "../cards/Pagination.js";
import { splitTypeFilter } from "../../lib/cardTypes.js";
import { resolvePackCodeFilter } from "../../lib/packFilters.js";
import { DeckList } from "./DeckList.js";
import { LegalityBox } from "./LegalityBox.js";
import { CostCurveChart } from "./CostCurveChart.js";
import { DeckWarnings } from "./DeckWarnings.js";

const PAGE_SIZE = 40;
const PLOT_PAGE_SIZE = 8;

export function BuildStepLayout({ deck, houseName }: { deck: DeckDetailResponse; houseName: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [detailCard, setDetailCard] = useState<Card | null>(null);

  const [activeFactions, setActiveFactions] = useState<string[]>([deck.factionCode, "neutral"]);
  const [activeTypes, setActiveTypes] = useState<CardTypeCode[]>([]);
  const [activeTraits, setActiveTraits] = useState<string[]>([]);
  const [activePacks, setActivePacks] = useState<string[]>([]);
  const [activeVariantPacks, setActiveVariantPacks] = useState<string[]>([]);
  const [activeIcons, setActiveIcons] = useState<string[]>([]);
  const [costMin, setCostMin] = useState<number | undefined>(undefined);
  const [costMax, setCostMax] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [plotPage, setPlotPage] = useState(1);

  const factionsQuery = useFactions();
  const traitsQuery = useTraits();
  const packsQuery = usePacks();

  const { mainTypes, showPlots } = splitTypeFilter(activeTypes);
  const packsLoaded = packsQuery.data !== undefined;
  const packCode = resolvePackCodeFilter(packsQuery.data?.items ?? [], activePacks, activeVariantPacks);

  const sharedFilters = {
    q: debouncedQuery || undefined,
    faction: activeFactions.length ? activeFactions : undefined,
    traits: activeTraits.length ? activeTraits : undefined,
    packCode,
    unique: activeIcons.includes("unique") || undefined,
    loyal: activeIcons.includes("loyal") || undefined,
    military: activeIcons.includes("military") || undefined,
    intrigue: activeIcons.includes("intrigue") || undefined,
    power: activeIcons.includes("power") || undefined,
    costMin,
    costMax,
  };

  const searchQuery = useCardSearch(
    {
      ...sharedFilters,
      type: mainTypes,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    },
    { enabled: mainTypes.length > 0 && packsLoaded }
  );

  const plotQuery = useCardSearch(
    {
      ...sharedFilters,
      type: ["plot"],
      limit: PLOT_PAGE_SIZE,
      offset: (plotPage - 1) * PLOT_PAGE_SIZE,
    },
    { enabled: showPlots && packsLoaded }
  );

  const setCard = useSetDeckCard(deck.id);
  const updateDeck = useUpdateDeck(deck.id);
  const deleteDeckMutation = useDeleteDeck();

  const deckCardLookup = useCardsByCode(deck.cards.map((c) => c.cardCode));

  const agendaLookup = useCardsByCode(deck.agendaCode ? [deck.agendaCode] : []);
  const agendaCard = deck.agendaCode ? agendaLookup.get(deck.agendaCode) : undefined;
  const bannerFactionCode = deck.agendaCode ? AGENDA_RULES[deck.agendaCode]?.bannerFaction : undefined;
  const bannerFactionName = bannerFactionCode
    ? (factionsQuery.data?.items.find((f) => f.code === bannerFactionCode)?.name ?? bannerFactionCode)
    : undefined;

  const [name, setName] = useState(deck.name);

  const countByCode = useMemo(() => {
    const m = new Map<string, number>();
    deck.cards.forEach((c) => m.set(c.cardCode, c.count));
    return m;
  }, [deck.cards]);

  function toggleFaction(code: string) {
    setActiveFactions((prev) => (prev.includes(code) ? prev.filter((f) => f !== code) : [...prev, code]));
    setPage(1);
    setPlotPage(1);
  }

  function toggleType(code: CardTypeCode) {
    setActiveTypes((prev) => (prev.includes(code) ? prev.filter((t) => t !== code) : [...prev, code]));
    setPage(1);
    setPlotPage(1);
  }

  function toggleTrait(trait: string) {
    setActiveTraits((prev) => (prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]));
    setPage(1);
    setPlotPage(1);
  }

  function togglePack(code: string) {
    setActivePacks((prev) => (prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]));
    setPage(1);
    setPlotPage(1);
  }

  function toggleVariantPack(code: string) {
    setActiveVariantPacks((prev) => (prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]));
    setPage(1);
    setPlotPage(1);
  }

  function toggleIcon(key: string) {
    setActiveIcons((prev) => (prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]));
    setPage(1);
    setPlotPage(1);
  }

  function handleCostChange(next: { costMin?: number; costMax?: number }) {
    if ("costMin" in next) setCostMin(next.costMin);
    if ("costMax" in next) setCostMax(next.costMax);
    setPage(1);
    setPlotPage(1);
  }

  function clearFilters() {
    setActiveFactions([]);
    setActiveTypes([]);
    setActiveTraits([]);
    setActivePacks([]);
    setActiveVariantPacks([]);
    setActiveIcons([]);
    setCostMin(undefined);
    setCostMax(undefined);
    setPage(1);
    setPlotPage(1);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
    setPlotPage(1);
  }

  function setCardCount(cardCode: string, count: number) {
    setCard.mutate({ cardCode, count });
  }

  function removeOne(cardCode: string) {
    const current = countByCode.get(cardCode) ?? 0;
    if (current <= 0) return;
    setCard.mutate({ cardCode, count: current - 1 });
  }

  function commitName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== deck.name) {
      updateDeck.mutate({ name: trimmed });
    } else {
      setName(deck.name);
    }
  }

  function handleDelete() {
    if (!confirm(`Delete "${deck.name}"? This can't be undone.`)) return;
    deleteDeckMutation.mutate(deck.id, { onSuccess: () => navigate("/decks") });
  }

  const results = (searchQuery.data?.items ?? []).filter((c) => c.typeCode !== "agenda");
  const total = searchQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const plotItems = plotQuery.data?.items ?? [];
  const plotTotal = plotQuery.data?.total ?? 0;
  const plotTotalPages = Math.max(1, Math.ceil(plotTotal / PLOT_PAGE_SIZE));

  const saving = setCard.isPending || updateDeck.isPending;

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-7 py-6">
      <CardSearchSidebar
        query={query}
        onQueryChange={handleQueryChange}
        factions={factionsQuery.data?.items ?? []}
        activeFactions={activeFactions}
        onToggleFaction={toggleFaction}
        activeTypes={activeTypes}
        onToggleType={toggleType}
        costMin={costMin}
        costMax={costMax}
        onCostChange={handleCostChange}
        traits={traitsQuery.data?.items ?? []}
        activeTraits={activeTraits}
        onToggleTrait={toggleTrait}
        packs={packsQuery.data?.items ?? []}
        activePacks={activePacks}
        onTogglePack={togglePack}
        activeVariantPacks={activeVariantPacks}
        onToggleVariantPack={toggleVariantPack}
        activeIcons={activeIcons}
        onToggleIcon={toggleIcon}
        onClearFilters={clearFilters}
      />

      <div className="flex-1">
        <div className="mb-3.5 flex items-center justify-between">
          <input
            aria-label="Deck name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            className="rounded border border-transparent bg-transparent text-base font-bold hover:border-border focus:border-accent focus:outline-none"
          />
          <div className="flex items-center gap-2.5">
            <div className="text-xs text-textMuted">{saving ? "Saving…" : "Saved"}</div>
            <button
              onClick={() => navigate("/decks")}
              className="rounded-sm border border-border px-4 py-1.5 text-[13px] text-textMuted"
            >
              Done
            </button>
            <button
              onClick={handleDelete}
              className="rounded-sm border border-danger/40 px-4 py-1.5 text-[13px] text-danger"
            >
              Delete
            </button>
          </div>
        </div>

        {searchQuery.isError && (
          <div className="rounded border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
            Couldn't load cards. Is the backend running?
          </div>
        )}

        {showPlots && plotItems.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 text-xs font-semibold text-textMuted">
              Plots {plotQuery.isLoading ? "" : `(${plotTotal})`}
            </div>
            <CardGrid
              cards={plotItems}
              onOpenDetail={setDetailCard}
              columns={2}
              selected={(card) => (countByCode.get(card.code) ?? 0) > 0}
              getDeckControls={(card) => ({
                count: countByCode.get(card.code) ?? 0,
                limit: card.deckLimit,
                onSetCount: (n) => setCardCount(card.code, n),
              })}
            />
            <Pagination page={plotPage} totalPages={plotTotalPages} onPageChange={setPlotPage} />
          </div>
        )}

        <CardGrid
          cards={results}
          onOpenDetail={setDetailCard}
          columns={3}
          selected={(card) => (countByCode.get(card.code) ?? 0) > 0}
          getDeckControls={(card) => ({
            count: countByCode.get(card.code) ?? 0,
            limit: card.deckLimit,
            onSetCount: (n) => setCardCount(card.code, n),
          })}
        />
        {!searchQuery.isError && results.length === 0 && plotItems.length === 0 && !searchQuery.isLoading && (
          <div className="py-10 text-center text-sm text-textMuted">No cards match these filters.</div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <div className="w-[270px] flex-none self-start rounded-lg border border-border bg-surface p-4">
        <div className="mb-3.5 flex justify-between text-[13px]">
          <div className={`font-bold ${deck.legality.legal ? "text-success" : "text-danger"}`}>
            {deck.legality.drawCount} / {deck.legality.requiredDraw} cards
          </div>
          <div className="text-textMuted">{houseName}</div>
        </div>

        {agendaCard && (
          <div className="mb-3.5 text-[13px] text-textMuted">
            Agenda: {agendaCard.name}
            {bannerFactionName ? ` · Banner: ${bannerFactionName}` : ""}
          </div>
        )}

        <LegalityBox tournamentLegality={deck.tournamentLegality} />

        <DeckList entries={deck.cards} cardLookup={deckCardLookup} onRemoveOne={removeOne} />

        <CostCurveChart entries={deck.cards} cardLookup={deckCardLookup} />

        <DeckWarnings legality={deck.legality} />
      </div>

      {detailCard && <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />}
    </div>
  );
}
