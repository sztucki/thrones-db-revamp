import type { Faction } from "@thronesdb/shared";

export function HouseStep({
  factions,
  onSelect,
}: {
  factions: Faction[];
  onSelect: (factionCode: string) => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-7 py-10 text-center">
      <div className="mb-1 text-lg font-bold">New Deck</div>
      <div className="mb-7 text-[13px] text-textMuted">Step 1 of 2 — choose your house</div>
      <div className="grid grid-cols-4 gap-3">
        {factions
          .filter((f) => f.code !== "neutral")
          .map((f) => (
            <div
              key={f.code}
              onClick={() => onSelect(f.code)}
              className="cursor-pointer rounded border border-border px-3 py-4 text-[13px] hover:border-accent"
            >
              <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-surface" />
              {f.name}
            </div>
          ))}
      </div>
    </div>
  );
}
