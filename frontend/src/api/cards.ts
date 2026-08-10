import type { Card, CardSearchQuery, CardSearchResult, Faction, Pack } from "@thronesdb/shared";
import { apiFetch } from "./client.js";

export function searchCards(query: CardSearchQuery): Promise<CardSearchResult> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.faction?.length) params.set("faction", query.faction.join(","));
  if (query.type?.length) params.set("type", query.type.join(","));
  if (query.traits?.length) params.set("traits", query.traits.join(","));
  if (query.packCode?.length) params.set("packCode", query.packCode.join(","));
  if (query.unique) params.set("unique", "1");
  if (query.loyal) params.set("loyal", "1");
  if (query.military) params.set("military", "1");
  if (query.intrigue) params.set("intrigue", "1");
  if (query.power) params.set("power", "1");
  if (query.costMin !== undefined) params.set("costMin", String(query.costMin));
  if (query.costMax !== undefined) params.set("costMax", String(query.costMax));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));
  return apiFetch<CardSearchResult>(`/cards?${params.toString()}`);
}

export function getFactions(): Promise<{ items: Faction[] }> {
  return apiFetch<{ items: Faction[] }>("/factions");
}

export function getTraits(): Promise<{ items: string[] }> {
  return apiFetch<{ items: string[] }>("/traits");
}

export function getPacks(): Promise<{ items: (Pack & { cycleName: string; cyclePosition: number })[] }> {
  return apiFetch<{ items: (Pack & { cycleName: string; cyclePosition: number })[] }>("/packs");
}

export function getCard(code: string): Promise<Card> {
  return apiFetch<Card>(`/cards/${code}`);
}
