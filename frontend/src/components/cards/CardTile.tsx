import type { Card } from "@thronesdb/shared";
import { clickableProps } from "../../lib/a11y.js";

export function CardTile({
  card,
  selected,
  onClick,
}: {
  card: Card;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      {...clickableProps(onClick)}
      aria-pressed={selected}
      className={`cursor-pointer overflow-hidden rounded ${
        selected ? "border-[1.5px] border-accent" : "border border-border"
      }`}
    >
      <div className="h-24 bg-[repeating-linear-gradient(45deg,oklch(0.92_0.006_250),oklch(0.92_0.006_250)_8px,oklch(0.96_0.004_250)_8px,oklch(0.96_0.004_250)_16px)]" />
      <div className="rounded-b bg-bg p-2.5">
        <div className="mb-0.5 text-[13px] font-semibold">{card.name}</div>
        <div className="text-[11px] text-textMuted capitalize">
          {card.typeCode} · cost {card.cost ?? card.costRaw ?? "–"} · {card.factionCode}
        </div>
      </div>
    </div>
  );
}
