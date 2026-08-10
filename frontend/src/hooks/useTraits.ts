import { useQuery } from "@tanstack/react-query";
import { getTraits } from "../api/cards.js";

export function useTraits() {
  return useQuery({
    queryKey: ["traits"],
    queryFn: getTraits,
    staleTime: Infinity,
  });
}
