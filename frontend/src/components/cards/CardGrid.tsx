import type { Card } from "@thronesdb/shared";
import { CardTile } from "./CardTile.js";

export function CardGrid({
  cards,
  compare,
  onToggleCompare,
}: {
  cards: Card[];
  compare: string[];
  onToggleCompare: (code: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3.5">
      {cards.map((card) => (
        <CardTile
          key={card.code}
          card={card}
          selected={compare.includes(card.code)}
          onClick={() => onToggleCompare(card.code)}
        />
      ))}
    </div>
  );
}
