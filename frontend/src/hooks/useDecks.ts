import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeckDetailResponse, DeckFormat } from "@thronesdb/shared";
import { createDeck, deleteDeck, getDeck, listDecks, setDeckCard, updateDeck } from "../api/decks.js";

const deckKey = (id: string) => ["deck", id];

export function useDecks(enabled = true) {
  return useQuery({ queryKey: ["decks"], queryFn: listDecks, enabled });
}

export function useDeck(id: string | undefined) {
  return useQuery({
    queryKey: deckKey(id ?? ""),
    queryFn: () => getDeck(id!),
    enabled: !!id,
  });
}

export function useCreateDeck() {
  return useMutation({
    mutationFn: (input: { name: string; factionCode: string; agendaCode: string | null; format: DeckFormat }) =>
      createDeck(input),
  });
}

export function useUpdateDeck(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { name?: string; agendaCode?: string | null }) => updateDeck(id, patch),
    onSuccess: (data) => queryClient.setQueryData<DeckDetailResponse>(deckKey(id), data),
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDeck(id),
    onSuccess: (_data, id) => queryClient.removeQueries({ queryKey: deckKey(id) }),
  });
}

export function useSetDeckCard(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardCode, count }: { cardCode: string; count: number }) => setDeckCard(id, cardCode, count),
    onSuccess: (data) => queryClient.setQueryData<DeckDetailResponse>(deckKey(id), data),
  });
}
