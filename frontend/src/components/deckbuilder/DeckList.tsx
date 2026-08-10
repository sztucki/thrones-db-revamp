import type { Card, DeckCardEntry } from "@thronesdb/shared";

export function DeckList({
  entries,
  cardLookup,
  onRemoveOne,
}: {
  entries: DeckCardEntry[];
  cardLookup: Map<string, Card>;
  onRemoveOne: (cardCode: string) => void;
}) {
  const rows = entries
    .map((e) => ({ entry: e, card: cardLookup.get(e.cardCode) }))
    .sort((a, b) => (a.card?.name ?? a.entry.cardCode).localeCompare(b.card?.name ?? b.entry.cardCode));

  if (rows.length === 0) {
    return <div className="mb-3.5 text-xs text-textMuted">No cards added yet — click a card to add it.</div>;
  }

  return (
    <div className="mb-3.5 flex max-h-56 flex-col overflow-y-auto">
      {rows.map(({ entry, card }) => (
        <div
          key={entry.cardCode}
          onClick={() => onRemoveOne(entry.cardCode)}
          className="flex cursor-pointer justify-between border-b border-border py-1.5 text-xs hover:text-danger"
          title="Click to remove one copy"
        >
          <span>{card?.name ?? entry.cardCode}</span>
          <span>x{entry.count}</span>
        </div>
      ))}
    </div>
  );
}
