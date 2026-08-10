import type { Card } from "@thronesdb/shared";

export function CompareTray({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return null;

  return (
    <div className="mt-4 flex items-center justify-between rounded border border-accent/45 bg-surfaceHighlight px-4 py-2.5">
      <div className="text-[13px] text-accent">
        Comparing: {cards.map((c) => c.name).join(", ")}
      </div>
      <button
        disabled
        title="Not built yet"
        className="cursor-not-allowed rounded-sm border border-accent bg-bg px-3.5 py-1.5 text-[13px] text-accent opacity-70"
      >
        View compare
      </button>
    </div>
  );
}
