# Handoff: ThronesDB Redesign

## Overview
A redesigned deck-building companion site for the Game of Thrones LCG (2nd Edition), inspired by ThronesDB. This redesign focuses on making card search and deck building easier and faster: fewer filters visible by default, live/instant filtering, a compare tray, and a search-and-build flow that keeps the deck list visible while browsing cards. It also adds a card Rulings/FAQ area and a Rules reference section, plus sign-in and a language switcher (EN/ES) in the header.

## About the Design Files
The files in this bundle are **design references built as interactive HTML prototypes** — they demonstrate intended layout, states, and interactions, but they are not production code to copy directly. The task is to recreate these designs in the target codebase's existing environment (React, Vue, etc.) using its established patterns, component library, and data layer — or, if no environment/stack exists yet, to choose the most appropriate framework and implement the designs there.

## Fidelity
**Medium-to-high fidelity.** Layout, spacing, typography, color, and interaction states (live filtering, expand/collapse, tab switching, add/remove from deck, login/logout) are intentionally designed and functional in the prototype. Content is sample/placeholder data (deck names, card names, review text) and card art is a placeholder striped pattern — real card images, full card data, and real user data should replace these. Treat the HTML/inline styles as the source of truth for spacing, color, and type; don't treat the sample data arrays as anything but shape/structure examples.

## Screens / Views
All screens live in one file (`ThronesDB Redesign.dc.html`) as tab-switched views within a single-page app shell. A companion file (`ThronesDB Wireframes.dc.html`) contains the earlier low-fidelity exploration (multiple layout options per screen) — useful for context on why the current layout was chosen, not meant to be built.

### Global header (present on every screen)
- Left: "ThronesDB" wordmark, then nav links: Cards, Decks, Reviews, Rules (each switches the active tab).
- Right: language switcher ("EN ▾" / "ES ▾" — click opens a small dropdown with English / Español), then either:
  - Signed out: a "Log in" button (outlined, accent color).
  - Signed in: a circular avatar button that opens a dropdown with "Signed in as {username}", "Edit profile", "Public account", and "Log out" (destructive-colored).
- Header is sticky to the top of the viewport.

### 1. Home
- "Continue where you left off" card: highlights the most recently edited deck with an "Edit deck" action (opens the deck builder for that deck).
- "My decks": a 3-column grid of deck cards (name, faction, card count, a small progress bar toward 60 cards) plus a "+ New deck" link.
- "Community news": a simple list of title + date rows.

### 2. Cards (search)
- Left sidebar: text search input, a collapsible "Faction" filter group (checkboxes, open by default) plus collapsed placeholder groups for Type/Cost/Traits/Set (not yet wired), and a "Clear filters" link.
- Main area: live result count ("N cards — updates live"), a sort control (static placeholder), and a 4-column grid of card results (name, type, cost, faction). Clicking a card toggles it into a "compare" selection (highlighted border).
- A compare bar appears at the bottom once 1+ cards are selected, showing the selected names and a "View compare" action (not yet wired to a real comparison view).
- A footer note links over to the Reviews section for rulings.

### 3. Decks (My Decks list)
- Same sidebar filter pattern as Cards, scoped to faction.
- Header row shows live count + active filter description, sort control, and "+ New deck".
- 3-column grid of deck cards (thumbnail placeholder, name, faction/card count/last edited) plus a dashed "+" add tile.

### 4. Deck builder (Create/Edit Deck)
Reached via "+ New deck" (Decks page) or "Edit deck" (Home). Three sequential states:
- **Step 1 — Choose house**: centered grid of house options (Stark, Lannister, Targaryen, Night's Watch in the prototype; real build has 8 factions). Selecting one advances to Step 2.
- **Step 2 — Choose agenda (optional)**: 2-3 agenda card options plus a "None" option, then a "Start building →" button.
- **Build**: two-column layout.
  - Left: deck name + "Autosaved" status + Cancel (returns to Decks) + Save buttons; search input; active filter chips (faction locked to chosen house); a 3-column grid of matching cards — click a card to add it to the deck (increments count if already present).
  - Right sidebar: running card count ("N / 60 cards", turns green at 60+), a **Tournament Legality** box (two format rows — Standard v2.1, Valyrian v1.0 — each showing a ✓/✗ per Joust and Melee, since legality rules differ per format and are recalculated live off the card count), the deck list itself (click a row to remove one copy), a simple cost-curve bar chart, and a warnings line (e.g. "Deck needs more cards to be legal").

### 5. Reviews (card rulings/FAQ)
- Feed view: a list of cards that have rulings, each showing a thumbnail, note count + date, and the first 2 FAQ notes with a "show N more" expand toggle. Clicking a card's row opens its detail page.
- Detail view: "← Back to reviews" link, card name/type/cost/faction, and three tabs — Overview (placeholder), Rulings (the full FAQ note list, this is the default tab), Decks with this card (placeholder).

### 6. Rules
- Sub-tabs: Rules Reference (built out), F.A.Q., Draft F.A.Q., Restrictions, Tournament Regulations (all four stubbed as placeholder text — need real content and design work).
- Rules Reference: a search input over the glossary; an A–Z letter jump-nav (only letters with content are shown/clickable); a left list of terms for the selected letter (or search matches); a right content pane with the selected term's summary and "Related" terms; an appendix footer line pointing to the Timing Chart and Cardtype Anatomy (not yet built — these need their own designs, likely diagrams/tables rather than glossary-style text).

## Interactions & Behavior
- All tab switches, filter toggles, and expand/collapse are instant (no transition/animation specified — add per your app's motion conventions).
- Live filtering on Cards/Decks/Rules search re-filters on every keystroke, client-side, against the sample in-memory arrays.
- Deck builder autosave label is currently static text ("Autosaved 12s ago") — needs real autosave wiring.
- "View compare" and the card detail "Overview"/"Decks with this card" tabs are placeholders with no real destination yet.
- Login/logout is a local UI toggle only — no real auth is wired.

## State Management
Suggested state shape (mirrors the prototype's logic class):
- `tab`: which top-level screen is active (home / search / decks / builder / reviews / rules)
- Cards search: `query` (string), `activeFactions` (string[]), `compare` (string[] of selected card names)
- Decks list: `deckActiveFactions` (string[])
- Deck builder: `builderStep` (house / agenda / build), `selectedHouse`, `selectedAgenda`, `builderQuery`, `builderDeck` (array of {name, count})
- Reviews: `expandedReviews` (string[] of card names with notes expanded), `detailCardName` (string|null), `detailTab` (overview / rulings / decks)
- Rules: `rulesSubTab`, `rulesQuery`, `rulesLetter`, `rulesTermName`
- Header: `lang` (EN/ES), `langOpen`, `loggedIn`, `accountOpen`

Data fetching needed for a real build: card database (search/filter), user's decks, deck contents, card rulings/FAQ content, rules glossary content, auth/session, i18n strings for EN/ES.

## Design Tokens
**Color** (all OKLCH, cool-neutral base with a single blue accent):
- Background: `oklch(0.98 0.003 250)` (page), `oklch(0.96 0.004 250)` / `oklch(0.94 0.01 255)` (subtle surfaces/highlights)
- Borders: `oklch(0.85–0.9 0.008 250)`
- Text: `oklch(0.22 0.01 250)` (primary), `oklch(0.5 0.008 250)` (muted/secondary)
- Accent (links, active states, primary actions): `oklch(0.5 0.14 255)` (blue)
- Success/legal: `oklch(0.5 0.14 145)` (green)
- Warning/illegal/destructive: `oklch(0.55 0.14 25)` (red)

**Typography:** Inter (400/500/600/700), system-ui fallback. Body copy ~13-14px, section headers ~16-18px, small meta text 11-12px.

**Radius:** 6-10px on cards/buttons/inputs.

**Spacing:** Roughly an 4/6/8/10/12/14/16/24/28px scale used throughout for gaps and padding.

## Assets
No real image/icon assets are used. Card art and deck thumbnails are CSS striped-gradient placeholders (`repeating-linear-gradient`) — replace with real card images. No custom icons; a couple of unicode glyphs (▾ ▸ ✓ ✗ ‹ ›) stand in for icons and should be swapped for a proper icon set.

## Files
- `ThronesDB Redesign.dc.html` — the current interactive design (all screens described above).
- `ThronesDB Wireframes.dc.html` — earlier low-fidelity exploration with multiple layout options per screen (context/history only).
