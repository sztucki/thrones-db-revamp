import { useQuery } from "@tanstack/react-query";
import { getPacks } from "../api/cards.js";

export function usePacks() {
  return useQuery({
    queryKey: ["packs"],
    queryFn: getPacks,
    staleTime: Infinity,
  });
}
