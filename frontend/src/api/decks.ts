import type { Deck, DeckDetailResponse, DeckFormat, DeckListResult } from "@thronesdb/shared";
import { apiFetch } from "./client.js";

export function listDecks(params: { limit?: number; offset?: number } = {}): Promise<DeckListResult> {
  const search = new URLSearchParams();
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString();
  return apiFetch<DeckListResult>(`/decks${qs ? `?${qs}` : ""}`);
}

export function getDeck(id: string): Promise<DeckDetailResponse> {
  return apiFetch<DeckDetailResponse>(`/decks/${id}`);
}

export function createDeck(input: {
  name: string;
  factionCode: string;
  agendaCode: string | null;
  format: DeckFormat;
}): Promise<Deck> {
  return apiFetch<Deck>("/decks", { method: "POST", body: JSON.stringify(input) });
}

export function updateDeck(
  id: string,
  patch: { name?: string; agendaCode?: string | null }
): Promise<DeckDetailResponse> {
  return apiFetch<DeckDetailResponse>(`/decks/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}

export function deleteDeck(id: string): Promise<void> {
  return apiFetch<void>(`/decks/${id}`, { method: "DELETE" });
}

export function setDeckCard(id: string, cardCode: string, count: number): Promise<DeckDetailResponse> {
  return apiFetch<DeckDetailResponse>(`/decks/${id}/cards/${cardCode}`, {
    method: "PUT",
    body: JSON.stringify({ count }),
  });
}
