import type { Card, DeckCardEntry } from "@thronesdb/shared";

const MAX_BUCKET = 6; // buckets 0..5, 6 = "6+"

function bucketize(entries: DeckCardEntry[], cardLookup: Map<string, Card>): number[] {
  const buckets = new Array(MAX_BUCKET + 1).fill(0);
  for (const entry of entries) {
    const card = cardLookup.get(entry.cardCode);
    if (!card || card.typeCode === "plot" || card.cost === null) continue;
    const bucket = Math.min(card.cost, MAX_BUCKET);
    buckets[bucket] += entry.count;
  }
  return buckets;
}

export function CostCurveChart({
  entries,
  cardLookup,
}: {
  entries: DeckCardEntry[];
  cardLookup: Map<string, Card>;
}) {
  const buckets = bucketize(entries, cardLookup);
  const max = Math.max(1, ...buckets);

  return (
    <div className="mb-3.5">
      <div className="mb-1.5 text-[11px] text-textMuted">Cost curve</div>
      <div className="flex h-9 items-end gap-1">
        {buckets.map((count, cost) => (
          <div
            key={cost}
            className="flex-1"
            title={`Cost ${cost === MAX_BUCKET ? "6+" : cost}: ${count} cards`}
          >
            <div
              className="rounded-t-sm bg-accent"
              style={{ height: count > 0 ? `${Math.max(3, (count / max) * 36)}px` : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-0.5 flex gap-1 text-[9px] text-textMuted">
        {buckets.map((_, cost) => (
          <div key={cost} className="flex-1 text-center">
            {cost === MAX_BUCKET ? "6+" : cost}
          </div>
        ))}
      </div>
    </div>
  );
}
