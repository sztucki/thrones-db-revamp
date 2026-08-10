import { useQuery } from "@tanstack/react-query";
import type { CardSearchQuery } from "@thronesdb/shared";
import { searchCards } from "../api/cards.js";

export function useCardSearch(query: CardSearchQuery) {
  return useQuery({
    queryKey: ["cards", query],
    queryFn: () => searchCards(query),
    placeholderData: (previous) => previous,
  });
}
