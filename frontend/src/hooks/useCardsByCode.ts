import { useQueries } from "@tanstack/react-query";
import type { Card } from "@thronesdb/shared";
import { getCard } from "../api/cards.js";

export function useCardsByCode(codes: string[]): Map<string, Card> {
  const results = useQueries({
    queries: codes.map((code) => ({
      queryKey: ["card", code],
      queryFn: () => getCard(code),
      staleTime: Infinity,
    })),
  });

  const lookup = new Map<string, Card>();
  results.forEach((r, i) => {
    if (r.data) lookup.set(codes[i], r.data);
  });
  return lookup;
}
