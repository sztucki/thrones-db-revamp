import { useState } from "react";
import type { CardTypeCode, Faction } from "@thronesdb/shared";
import { clickableProps } from "../../lib/a11y.js";

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

const STUB_GROUPS = ["Cost", "Traits", "Set / Icons"];

export function CardSearchSidebar({
  query,
  onQueryChange,
  factions,
  activeFactions,
  onToggleFaction,
  activeTypes,
  onToggleType,
  onClearFilters,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  factions: Faction[];
  activeFactions: string[];
  onToggleFaction: (code: string) => void;
  activeTypes: CardTypeCode[];
  onToggleType: (code: CardTypeCode) => void;
  onClearFilters: () => void;
}) {
  const [factionOpen, setFactionOpen] = useState(true);
  const [typeOpen, setTypeOpen] = useState(true);

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
                    <span className="text-[9px] leading-none text-bg">✓</span>
                  )}
                </div>
                {t.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {STUB_GROUPS.map((label) => (
        <div key={label} className="mb-2.5 cursor-not-allowed border-b border-border pb-2.5 text-[13px] text-textMuted">
          ▸ {label}
        </div>
      ))}

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
