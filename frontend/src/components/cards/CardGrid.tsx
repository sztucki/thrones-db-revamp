import type { Card } from "@thronesdb/shared";
import { CardTile, type DeckControls } from "./CardTile.js";

export function CardGrid({
  cards,
  onOpenDetail,
  columns = 4,
  selected,
  getDeckControls,
}: {
  cards: Card[];
  onOpenDetail: (card: Card) => void;
  columns?: 2 | 3 | 4;
  selected?: (card: Card) => boolean;
  getDeckControls?: (card: Card) => DeckControls | undefined;
}) {
  const gridClass =
    columns === 2 ? "grid grid-cols-2 gap-3.5" : columns === 3 ? "grid grid-cols-3 gap-3" : "grid grid-cols-4 gap-3.5";

  return (
    <div className={gridClass}>
      {cards.map((card) => (
        <CardTile
          key={card.code}
          card={card}
          selected={selected?.(card) ?? false}
          onClick={() => onOpenDetail(card)}
          deckControls={getDeckControls?.(card)}
        />
      ))}
    </div>
  );
}
