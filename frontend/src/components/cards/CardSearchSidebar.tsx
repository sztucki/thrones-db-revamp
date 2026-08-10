import { useState } from "react";
import type { CardTypeCode, Faction } from "@thronesdb/shared";
import { clickableProps } from "../../lib/a11y.js";

export interface PackOption {
  code: string;
  name: string;
  cycleName: string;
  cyclePosition: number;
  position: number;
}

const ICON_OPTIONS: { key: "unique" | "loyal" | "military" | "intrigue" | "power"; label: string }[] = [
  { key: "unique", label: "Unique" },
  { key: "loyal", label: "Loyal" },
  { key: "military", label: "Military icon" },
  { key: "intrigue", label: "Intrigue icon" },
  { key: "power", label: "Power icon" },
];

const FACTION_COLORS: Record<string, string> = {
  stark: "oklch(0.55 0.05 255)",
  lannister: "oklch(0.6 0.14 85)",
  targaryen: "oklch(0.45 0.14 25)",
  thenightswatch: "oklch(0.4 0.01 255)",
  baratheon: "oklch(0.6 0.12 85)",
  greyjoy: "oklch(0.4 0.03 220)",
  martell: "oklch(0.55 0.12 45)",
  tyrell: "oklch(0.55 0.1 145)",
  neutral: "oklch(0.6 0.008 250)",
};

const TYPE_OPTIONS: { code: CardTypeCode; label: string }[] = [
  { code: "character", label: "Character" },
  { code: "location", label: "Location" },
  { code: "attachment", label: "Attachment" },
  { code: "event", label: "Event" },
  { code: "plot", label: "Plot" },
  { code: "agenda", label: "Agenda" },
  { code: "title", label: "Title" },
];

export function CardSearchSidebar({
  query,
  onQueryChange,
  factions,
  activeFactions,
  onToggleFaction,
  activeTypes,
  onToggleType,
  costMin,
  costMax,
  onCostChange,
  traits,
  activeTraits,
  onToggleTrait,
  packs,
  activePacks,
  onTogglePack,
  activeIcons,
  onToggleIcon,
  onClearFilters,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  factions: Faction[];
  activeFactions: string[];
  onToggleFaction: (code: string) => void;
  activeTypes: CardTypeCode[];
  onToggleType: (code: CardTypeCode) => void;
  costMin: number | undefined;
  costMax: number | undefined;
  onCostChange: (next: { costMin?: number; costMax?: number }) => void;
  traits: string[];
  activeTraits: string[];
  onToggleTrait: (trait: string) => void;
  packs: PackOption[];
  activePacks: string[];
  onTogglePack: (code: string) => void;
  activeIcons: string[];
  onToggleIcon: (key: string) => void;
  onClearFilters: () => void;
}) {
  const [factionOpen, setFactionOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);
  const [costOpen, setCostOpen] = useState(true);
  const [traitsOpen, setTraitsOpen] = useState(true);
  const [setOpen, setSetOpen] = useState(false);
  const [iconsOpen, setIconsOpen] = useState(false);
  const [traitFilter, setTraitFilter] = useState("");
  const [packFilter, setPackFilter] = useState("");

  const visibleTraits = traits.filter(
    (t) => activeTraits.includes(t) || t.toLowerCase().includes(traitFilter.toLowerCase())
  );

  const visiblePacks = packs.filter(
    (p) => activePacks.includes(p.code) || p.name.toLowerCase().includes(packFilter.toLowerCase())
  );
  const packsByCycle = new Map<string, PackOption[]>();
  for (const p of visiblePacks) {
    const list = packsByCycle.get(p.cycleName) ?? [];
    list.push(p);
    packsByCycle.set(p.cycleName, list);
  }

  function parseCostInput(raw: string): number | undefined {
    if (raw === "") return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }

  return (
    <div className="w-[220px] flex-none">
      <input
        aria-label="Search card text"
        placeholder="Search card text…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="mb-4 w-full rounded border border-border bg-surface px-3 py-2 text-[13px] text-text placeholder:text-textMuted"
      />

      <div className="mb-3 border-b border-border pb-3">
        <div
          {...clickableProps(() => setFactionOpen((v) => !v))}
          aria-expanded={factionOpen}
          className="mb-2 flex cursor-pointer justify-between text-[13px] font-semibold"
        >
          <span>Faction</span>
          <span>{factionOpen ? "▾" : "▸"}</span>
        </div>
        {factionOpen && (
          <div className="flex flex-col gap-1.5 pl-0.5">
            {factions
              .filter((f) => f.code !== "neutral")
              .map((f) => (
                <div
                  key={f.code}
                  {...clickableProps(() => onToggleFaction(f.code))}
                  aria-pressed={activeFactions.includes(f.code)}
                  className="flex cursor-pointer items-center gap-2 text-[13px]"
                >
                  <div
                    className="h-[13px] w-[13px] flex-shrink-0 rounded-sm border border-border"
                    style={{
                      background: activeFactions.includes(f.code)
                        ? FACTION_COLORS[f.code]
                        : "oklch(0.96 0.004 250)",
                    }}
                  />
                  {f.name}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="mb-3 border-b border-border pb-3">
        <div
          {...clickableProps(() => setTypeOpen((v) => !v))}
          aria-expanded={typeOpen}
          className="mb-2 flex cursor-pointer justify-between text-[13px] font-semibold"
        >
          <span>Type</span>
          <span>{typeOpen ? "▾" : "▸"}</span>
        </div>
        {typeOpen && (
          <div className="flex flex-col gap-1.5 pl-0.5">
            {TYPE_OPTIONS.map((t) => (
              <div
                key={t.code}
                {...clickableProps(() => onToggleType(t.code))}
                aria-pressed={activeTypes.includes(t.code)}
                className="flex cursor-pointer items-center gap-2 text-[13px]"
              >
                <div
                  className="flex h-[13px] w-[13px] flex-shrink-0 items-center justify-center rounded-sm border border-border"
                  style={{
                    background: activeTypes.includes(t.code) ? "oklch(0.5 0.14 255)" : "oklch(0.96 0.004 250)",
                  }}
                >
                  {activeTypes.includes(t.code) && (
                    <span aria-hidden="true" className="text-[9px] leading-none text-bg">✓</span>
                  )}
                </div>
                {t.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3 border-b border-border pb-3">
        <div
          {...clickableProps(() => setCostOpen((v) => !v))}
          aria-expanded={costOpen}
          className="mb-2 flex cursor-pointer justify-between text-[13px] font-semibold"
        >
          <span>Cost</span>
          <span>{costOpen ? "▾" : "▸"}</span>
        </div>
        {costOpen && (
          <div className="flex items-center gap-2 pl-0.5 text-[13px]">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="Minimum cost"
              placeholder="Min"
              value={costMin ?? ""}
              onChange={(e) => onCostChange({ costMin: parseCostInput(e.target.value) })}
              className="w-16 rounded border border-border bg-surface px-2 py-1 text-text"
            />
            <span className="text-textMuted">–</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="Maximum cost"
              placeholder="Max"
              value={costMax ?? ""}
              onChange={(e) => onCostChange({ costMax: parseCostInput(e.target.value) })}
              className="w-16 rounded border border-border bg-surface px-2 py-1 text-text"
            />
          </div>
        )}
      </div>

      <div className="mb-3 border-b border-border pb-3">
        <div
          {...clickableProps(() => setTraitsOpen((v) => !v))}
          aria-expanded={traitsOpen}
          className="mb-2 flex cursor-pointer justify-between text-[13px] font-semibold"
        >
          <span>Traits{activeTraits.length > 0 ? ` (${activeTraits.length})` : ""}</span>
          <span>{traitsOpen ? "▾" : "▸"}</span>
        </div>
        {traitsOpen && (
          <>
            <input
              aria-label="Filter traits"
              placeholder="Filter traits…"
              value={traitFilter}
              onChange={(e) => setTraitFilter(e.target.value)}
              className="mb-2 w-full rounded border border-border bg-surface px-2 py-1 text-[13px] text-text placeholder:text-textMuted"
            />
            <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto pl-0.5">
              {visibleTraits.map((t) => (
                <div
                  key={t}
                  {...clickableProps(() => onToggleTrait(t))}
                  aria-pressed={activeTraits.includes(t)}
                  className="flex cursor-pointer items-center gap-2 text-[13px]"
                >
                  <div
                    className="flex h-[13px] w-[13px] flex-shrink-0 items-center justify-center rounded-sm border border-border"
                    style={{
                      background: activeTraits.includes(t) ? "oklch(0.5 0.14 255)" : "oklch(0.96 0.004 250)",
                    }}
                  >
                    {activeTraits.includes(t) && (
                      <span aria-hidden="true" className="text-[9px] leading-none text-bg">✓</span>
                    )}
                  </div>
                  {t}
                </div>
              ))}
              {visibleTraits.length === 0 && (
                <div className="text-[12px] text-textMuted">No traits match "{traitFilter}"</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mb-3 border-b border-border pb-3">
        <div
          {...clickableProps(() => setSetOpen((v) => !v))}
          aria-expanded={setOpen}
          className="mb-2 flex cursor-pointer justify-between text-[13px] font-semibold"
        >
          <span>Set{activePacks.length > 0 ? ` (${activePacks.length})` : ""}</span>
          <span>{setOpen ? "▾" : "▸"}</span>
        </div>
        {setOpen && (
          <>
            <input
              aria-label="Filter sets"
              placeholder="Filter sets…"
              value={packFilter}
              onChange={(e) => setPackFilter(e.target.value)}
              className="mb-2 w-full rounded border border-border bg-surface px-2 py-1 text-[13px] text-text placeholder:text-textMuted"
            />
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pl-0.5">
              {[...packsByCycle.entries()].map(([cycleName, cyclePacks]) => (
                <div key={cycleName}>
                  <div className="mb-1 text-[11px] font-semibold uppercase text-textMuted">{cycleName}</div>
                  <div className="flex flex-col gap-1.5">
                    {cyclePacks.map((p) => (
                      <div
                        key={p.code}
                        {...clickableProps(() => onTogglePack(p.code))}
                        aria-pressed={activePacks.includes(p.code)}
                        className="flex cursor-pointer items-center gap-2 text-[13px]"
                      >
                        <div
                          className="flex h-[13px] w-[13px] flex-shrink-0 items-center justify-center rounded-sm border border-border"
                          style={{
                            background: activePacks.includes(p.code) ? "oklch(0.5 0.14 255)" : "oklch(0.96 0.004 250)",
                          }}
                        >
                          {activePacks.includes(p.code) && (
                            <span aria-hidden="true" className="text-[9px] leading-none text-bg">✓</span>
                          )}
                        </div>
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {visiblePacks.length === 0 && (
                <div className="text-[12px] text-textMuted">No sets match "{packFilter}"</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mb-3 border-b border-border pb-3">
        <div
          {...clickableProps(() => setIconsOpen((v) => !v))}
          aria-expanded={iconsOpen}
          className="mb-2 flex cursor-pointer justify-between text-[13px] font-semibold"
        >
          <span>Icons{activeIcons.length > 0 ? ` (${activeIcons.length})` : ""}</span>
          <span>{iconsOpen ? "▾" : "▸"}</span>
        </div>
        {iconsOpen && (
          <div className="flex flex-col gap-1.5 pl-0.5">
            {ICON_OPTIONS.map((opt) => (
              <div
                key={opt.key}
                {...clickableProps(() => onToggleIcon(opt.key))}
                aria-pressed={activeIcons.includes(opt.key)}
                className="flex cursor-pointer items-center gap-2 text-[13px]"
              >
                <div
                  className="flex h-[13px] w-[13px] flex-shrink-0 items-center justify-center rounded-sm border border-border"
                  style={{
                    background: activeIcons.includes(opt.key) ? "oklch(0.5 0.14 255)" : "oklch(0.96 0.004 250)",
                  }}
                >
                  {activeIcons.includes(opt.key) && (
                    <span aria-hidden="true" className="text-[9px] leading-none text-bg">✓</span>
                  )}
                </div>
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClearFilters();
        }}
        className="text-xs"
      >
        Clear filters
      </a>
    </div>
  );
}
