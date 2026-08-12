import { Link } from "react-router-dom";
import type { DeckSummary } from "@thronesdb/shared";
import { useSession } from "../hooks/useSession.js";
import { useDecks } from "../hooks/useDecks.js";
import { useFactions } from "../hooks/useFactions.js";

const RECENT_DECKS_LIMIT = 4;

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function HomePage() {
  const sessionQuery = useSession();
  const loggedIn = !!sessionQuery.data?.user;
  const decksQuery = useDecks({ limit: RECENT_DECKS_LIMIT }, loggedIn);
  const factionsQuery = useFactions();

  const factionName = (code: string) =>
    factionsQuery.data?.items.find((f) => f.code === code)?.name ?? code;

  if (sessionQuery.data && !sessionQuery.data.user) {
    return (
      <div className="mx-auto max-w-3xl px-7 py-16 text-center">
        <div className="text-lg font-bold">Welcome to ThronesDB</div>
        <div className="mt-2 text-sm text-textMuted">
          Search the full Game of Thrones LCG 2nd Edition card pool and build tournament-legal decks.
        </div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/cards"
            className="rounded-sm border border-accent px-4 py-1.5 text-[13px] font-medium text-accent"
          >
            Browse cards
          </Link>
        </div>
      </div>
    );
  }

  const decks = decksQuery.data?.items ?? [];
  const [latestDeck, ...restDecks] = decks;

  return (
    <div className="mx-auto max-w-3xl px-7 py-10">
      {loggedIn && latestDeck && <ContinueDeckCard deck={latestDeck} factionName={factionName} />}

      <div className="mb-6 flex items-center justify-between">
        <div className="text-lg font-bold">My Decks</div>
        <div className="flex items-center gap-4 text-[13px]">
          {decks.length > 0 && (
            <Link to="/decks" className="text-accent">
              See all
            </Link>
          )}
          <Link
            to="/decks/new"
            className="rounded-sm border border-accent px-4 py-1.5 font-medium text-accent"
          >
            + New Deck
          </Link>
        </div>
      </div>

      {decksQuery.isLoading && <div className="py-10 text-center text-sm text-textMuted">Loading decks…</div>}

      {decksQuery.isError && (
        <div className="rounded border border-danger/40 bg-danger/5 p-4 text-sm text-danger">
          Couldn't load your decks. Is the backend running?
        </div>
      )}

      {!decksQuery.isLoading && !decksQuery.isError && decks.length === 0 && (
        <div className="py-10 text-center text-sm text-textMuted">
          You haven't built any decks yet. Start with "+ New Deck".
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(latestDeck ? restDecks : decks).map((deck) => (
          <DeckTile key={deck.id} deck={deck} factionName={factionName} />
        ))}
      </div>
    </div>
  );
}

function ContinueDeckCard({
  deck,
  factionName,
}: {
  deck: DeckSummary;
  factionName: (code: string) => string;
}) {
  return (
    <div className="mb-8 rounded border-l-4 border-accent bg-surface px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-textMuted">
        Continue where you left off
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{deck.name}</div>
          <div className="truncate text-[13px] text-textMuted">
            {factionName(deck.factionCode)} · {deck.drawCount} cards · edited {relativeTime(deck.updatedAt)}
          </div>
        </div>
        <Link
          to={`/decks/${deck.id}/edit`}
          className="flex-none rounded-sm border border-accent px-4 py-1.5 text-[13px] font-medium text-accent"
        >
          Edit deck
        </Link>
      </div>
    </div>
  );
}

function DeckTile({ deck, factionName }: { deck: DeckSummary; factionName: (code: string) => string }) {
  const pct = Math.min(100, Math.round((deck.drawCount / deck.requiredDraw) * 100));
  return (
    <Link
      to={`/decks/${deck.id}/edit`}
      className="rounded border border-border px-4 py-3 text-[13px] hover:border-accent"
    >
      <div className="truncate font-semibold">{deck.name}</div>
      <div className="truncate text-textMuted">
        {factionName(deck.factionCode)} · {deck.drawCount} cards
      </div>
      <div className="mt-2 h-1 rounded-full bg-border">
        <div
          className={`h-1 rounded-full ${deck.legal ? "bg-success" : "bg-danger"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
