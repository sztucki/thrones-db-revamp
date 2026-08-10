import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Card, DeckDetailResponse } from "@thronesdb/shared";
import { useCardSearch } from "../../hooks/useCardSearch.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { useCardsByCode } from "../../hooks/useCardsByCode.js";
import { useDeleteDeck, useSetDeckCard, useUpdateDeck } from "../../hooks/useDecks.js";
import { CardTile } from "../cards/CardTile.js";
import { DeckList } from "./DeckList.js";
import { LegalityBox } from "./LegalityBox.js";
import { CostCurveChart } from "./CostCurveChart.js";
import { DeckWarnings } from "./DeckWarnings.js";

export function BuildStepLayout({ deck, houseName }: { deck: DeckDetailResponse; houseName: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);

  const searchQuery = useCardSearch({
    q: debouncedQuery || undefined,
    faction: [deck.factionCode, "neutral"],
    limit: 60,
  });

  const setCard = useSetDeckCard(deck.id);
  const updateDeck = useUpdateDeck(deck.id);
  const deleteDeckMutation = useDeleteDeck();

  const deckCardLookup = useCardsByCode(deck.cards.map((c) => c.cardCode));

  const [name, setName] = useState(deck.name);

  const countByCode = useMemo(() => {
    const m = new Map<string, number>();
    deck.cards.forEach((c) => m.set(c.cardCode, c.count));
    return m;
  }, [deck.cards]);

  function addOne(card: Card) {
    const current = countByCode.get(card.code) ?? 0;
    if (current >= card.deckLimit || current >= 10) return;
    setCard.mutate({ cardCode: card.code, count: current + 1 });
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
  const saving = setCard.isPending || updateDeck.isPending;

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-7 py-6">
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

        <input
          aria-label="Search card text"
          placeholder="Search card text…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2.5 w-full rounded border border-border bg-surface px-3 py-2 text-[13px] text-text placeholder:text-textMuted"
        />
        <div className="mb-3.5 flex gap-1.5">
          <div className="rounded-[10px] border border-border bg-surfaceHighlight px-2.5 py-0.5 text-xs text-accent">
            Faction: {houseName}
          </div>
        </div>

        {searchQuery.isError && (
          <div className="rounded border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
            Couldn't load cards. Is the backend running?
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {results.map((card) => (
            <CardTile
              key={card.code}
              card={card}
              selected={(countByCode.get(card.code) ?? 0) > 0}
              onClick={() => addOne(card)}
            />
          ))}
        </div>
        {!searchQuery.isError && results.length === 0 && !searchQuery.isLoading && (
          <div className="py-10 text-center text-sm text-textMuted">No cards match these filters.</div>
        )}
      </div>

      <div className="w-[270px] flex-none self-start rounded-lg border border-border bg-surface p-4">
        <div className="mb-3.5 flex justify-between text-[13px]">
          <div className={`font-bold ${deck.legality.legal ? "text-success" : "text-danger"}`}>
            {deck.legality.drawCount} / {deck.legality.requiredDraw} cards
          </div>
          <div className="text-textMuted">{houseName}</div>
        </div>

        <LegalityBox legality={deck.legality} />

        <DeckList entries={deck.cards} cardLookup={deckCardLookup} onRemoveOne={removeOne} />

        <CostCurveChart entries={deck.cards} cardLookup={deckCardLookup} />

        <DeckWarnings legality={deck.legality} />
      </div>
    </div>
  );
}
