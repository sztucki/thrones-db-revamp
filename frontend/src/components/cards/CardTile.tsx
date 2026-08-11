import type { Card } from "@thronesdb/shared";
import { clickableProps } from "../../lib/a11y.js";

export function CardTile({
  card,
  selected,
  onClick,
  deckControls,
}: {
  card: Card;
  selected: boolean;
  onClick: () => void;
  deckControls?: { count: number; limit: number; onSetCount: (count: number) => void };
}) {
  return (
    <div
      {...clickableProps(onClick)}
      className={`cursor-pointer overflow-hidden rounded ${
        selected ? "border-[1.5px] border-accent" : "border border-border"
      }`}
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          className="aspect-[15/14] w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <div className="aspect-[15/14] bg-[repeating-linear-gradient(45deg,oklch(0.92_0.006_250),oklch(0.92_0.006_250)_8px,oklch(0.96_0.004_250)_8px,oklch(0.96_0.004_250)_16px)]" />
      )}
      <div className="rounded-b bg-bg p-2.5">
        <div className="mb-0.5 text-[13px] font-semibold">{card.name}</div>
        <div className="text-[11px] text-textMuted capitalize">
          {card.typeCode} · cost {card.cost ?? card.costRaw ?? "–"} · {card.factionCode}
        </div>
        {deckControls && (
          <div
            className="mt-1.5 flex gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {Array.from({ length: Math.min(3, deckControls.limit) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => deckControls.onSetCount(n)}
                aria-pressed={deckControls.count === n}
                className={`flex-1 rounded-sm border py-0.5 text-[11px] font-semibold ${
                  deckControls.count === n
                    ? "border-accent bg-accent text-bg"
                    : "border-border text-textMuted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
