import type { Card } from "@thronesdb/shared";
import { CardTile } from "./CardTile.js";

export function CardGrid({
  cards,
  onOpenDetail,
}: {
  cards: Card[];
  onOpenDetail: (card: Card) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3.5">
      {cards.map((card) => (
        <CardTile
          key={card.code}
          card={card}
          selected={false}
          onClick={() => onOpenDetail(card)}
        />
      ))}
    </div>
  );
}
