export type CardTypeCode =
  | "character"
  | "plot"
  | "location"
  | "attachment"
  | "event"
  | "agenda"
  | "title";

export interface Faction {
  code: string;
  name: string;
  isPrimary: boolean;
}

export interface Cycle {
  code: string;
  name: string;
  position: number;
}

export interface Pack {
  code: string;
  name: string;
  cycleCode: string;
  position: number;
  size: number | null;
  dateRelease: string | null;
}

export interface Card {
  code: string;
  name: string;
  typeCode: CardTypeCode;
  factionCode: string;
  cost: number | null;
  income: number | null;
  initiative: number | null;
  claim: number | null;
  reserve: number | null;
  text: string;
  traits: string[];
  isLoyal: boolean;
  isUnique: boolean;
  isMilitary: boolean;
  isIntrigue: boolean;
  isPower: boolean;
  strength: number | null;
  deckLimit: number;
  packCode: string;
  illustrator: string | null;
  flavor: string | null;
  position: number;
  imageUrl: string | null;
}

export interface CardSearchQuery {
  q?: string;
  faction?: string[];
  type?: CardTypeCode[];
  costMin?: number;
  costMax?: number;
  traits?: string[];
  limit?: number;
  offset?: number;
}

export interface CardSearchResult {
  items: Card[];
  total: number;
}

export interface DeckCardEntry {
  cardCode: string;
  count: number;
}

export type DeckFormat = "joust" | "melee";

export interface Deck {
  id: string;
  userId: string;
  name: string;
  factionCode: string;
  agendaCode: string | null;
  format: DeckFormat;
  cards: DeckCardEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DeckSummary {
  id: string;
  name: string;
  factionCode: string;
  agendaCode: string | null;
  format: DeckFormat;
  cardCount: number;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface SessionResponse {
  user: User | null;
}
