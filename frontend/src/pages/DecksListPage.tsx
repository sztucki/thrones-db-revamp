import { Link } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { useDecks } from "../hooks/useDecks.js";
import { useFactions } from "../hooks/useFactions.js";

export function DecksListPage() {
  const sessionQuery = useSession();
  const decksQuery = useDecks(!!sessionQuery.data?.user);
  const factionsQuery = useFactions();

  const factionName = (code: string) =>
    factionsQuery.data?.items.find((f) => f.code === code)?.name ?? code;

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
        {decksQuery.data?.items.map((deck) => (
          <Link
            key={deck.id}
            to={`/decks/${deck.id}/edit`}
            className="flex items-center justify-between rounded border border-border px-4 py-3 text-[13px] hover:border-accent"
          >
            <span className="font-semibold">{deck.name}</span>
            <span className="text-textMuted">
              {factionName(deck.factionCode)} · {deck.cardCount} cards
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
