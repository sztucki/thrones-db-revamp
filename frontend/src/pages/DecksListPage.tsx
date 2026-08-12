import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AGENDA_RULES } from "@thronesdb/shared";
import { useSession } from "../hooks/useSession.js";
import { useDecks, useDeleteDeck } from "../hooks/useDecks.js";
import { useFactions } from "../hooks/useFactions.js";
import { useCardsByCode } from "../hooks/useCardsByCode.js";
import { Pagination } from "../components/cards/Pagination.js";
import { LegalityBox } from "../components/deckbuilder/LegalityBox.js";

const PAGE_SIZE = 20;

const FACTION_BANNER_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(AGENDA_RULES)
    .filter(([, rule]) => rule.bannerFaction)
    .map(([code, rule]) => [rule.bannerFaction!, code])
);

function CardThumbnail({ imageUrl, alt }: { imageUrl: string | null | undefined; alt: string }) {
  return imageUrl ? (
    <img
      src={imageUrl}
      alt={alt}
      className="h-28 w-20 flex-none rounded-sm bg-bg object-contain"
      loading="lazy"
    />
  ) : (
    <div className="h-28 w-20 flex-none rounded-sm bg-[repeating-linear-gradient(45deg,oklch(0.92_0.006_250),oklch(0.92_0.006_250)_6px,oklch(0.96_0.004_250)_6px,oklch(0.96_0.004_250)_12px)]" />
  );
}

export function DecksListPage() {
  const sessionQuery = useSession();
  const [page, setPage] = useState(1);
  const decksQuery = useDecks(
    { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    !!sessionQuery.data?.user
  );
  const factionsQuery = useFactions();
  const deleteDeck = useDeleteDeck();

  const items = decksQuery.data?.items ?? [];
  const cardCodes = [
    ...new Set(
      items
        .flatMap((d) => [d.agendaCode, FACTION_BANNER_CODE[d.factionCode]])
        .filter((code): code is string => !!code)
    ),
  ];
  const cardLookup = useCardsByCode(cardCodes);

  const factionName = (code: string) =>
    factionsQuery.data?.items.find((f) => f.code === code)?.name ?? code;

  const total = decksQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (!decksQuery.isLoading && page > totalPages) {
      setPage(totalPages);
    }
  }, [decksQuery.isLoading, page, totalPages]);

  function handleDelete(deckId: string, deckName: string) {
    if (!confirm(`Delete "${deckName}"? This can't be undone.`)) return;
    deleteDeck.mutate(deckId);
  }

  if (sessionQuery.data && !sessionQuery.data.user) {
    return (
      <div className="mx-auto max-w-3xl px-7 py-16 text-center text-sm text-textMuted">
        Log in to see and build your decks.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-7 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-lg font-bold">My Decks</div>
        <Link
          to="/decks/new"
          className="rounded-sm border border-accent px-4 py-1.5 text-[13px] font-medium text-accent"
        >
          + New Deck
        </Link>
      </div>

      {decksQuery.isLoading && <div className="py-10 text-center text-sm text-textMuted">Loading decks…</div>}

      {decksQuery.isError && (
        <div className="rounded border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
          Couldn't load your decks. Is the backend running?
        </div>
      )}

      {!decksQuery.isLoading && !decksQuery.isError && decksQuery.data?.items.length === 0 && (
        <div className="py-10 text-center text-sm text-textMuted">
          You haven't built any decks yet. Start with "+ New Deck".
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((deck) => {
          const bannerCard = FACTION_BANNER_CODE[deck.factionCode]
            ? cardLookup.get(FACTION_BANNER_CODE[deck.factionCode])
            : undefined;
          const agendaCard = deck.agendaCode ? cardLookup.get(deck.agendaCode) : undefined;
          return (
            <div
              key={deck.id}
              className="rounded border border-border px-4 py-3 text-[13px] hover:border-accent"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <Link to={`/decks/${deck.id}/edit`} className="flex min-w-0 flex-1 items-center gap-3">
                  <CardThumbnail imageUrl={bannerCard?.imageUrl} alt={factionName(deck.factionCode)} />
                  <CardThumbnail imageUrl={agendaCard?.imageUrl} alt={agendaCard?.name ?? "No agenda"} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{deck.name}</div>
                    <div className="truncate text-textMuted">
                      {factionName(deck.factionCode)}
                      {agendaCard ? ` · ${agendaCard.name}` : ""}
                    </div>
                  </div>
                  <div className={`flex-none font-semibold ${deck.legal ? "text-success" : "text-danger"}`}>
                    {deck.drawCount}/{deck.requiredDraw} cards
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(deck.id, deck.name)}
                  aria-label={`Delete ${deck.name}`}
                  className="flex-none rounded-sm border border-danger/40 px-3 py-1.5 text-danger"
                >
                  Delete
                </button>
              </div>
              <LegalityBox tournamentLegality={deck.tournamentLegality} />
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
