import { useQuery } from "@tanstack/react-query";
import { getFactions } from "../api/cards.js";

export function useFactions() {
  return useQuery({
    queryKey: ["factions"],
    queryFn: getFactions,
    staleTime: Infinity,
  });
}
