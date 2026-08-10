import type { Deck, DeckDetailResponse, DeckFormat, DeckSummary } from "@thronesdb/shared";
import { apiFetch } from "./client.js";

export function listDecks(): Promise<{ items: DeckSummary[] }> {
  return apiFetch<{ items: DeckSummary[] }>("/decks");
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
