import type { DeckFormat, TournamentLegalityCell } from "@thronesdb/shared";

const FORMAT_LABEL: Record<DeckFormat, string> = {
  joust: "Joust",
  melee: "Melee",
};
const FORMATS: DeckFormat[] = ["joust", "melee"];

export function LegalityBox({ tournamentLegality }: { tournamentLegality: TournamentLegalityCell[] }) {
  const listNames = [...new Set(tournamentLegality.map((c) => c.listName))];

  return (
    <div className="mb-4 rounded border border-border bg-bg p-3">
      <div className="mb-2 text-xs font-semibold">Tournament Legality</div>
      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-y-1.5 text-xs">
        <div />
        {FORMATS.map((format) => (
          <div key={format} className="text-textMuted">
            {FORMAT_LABEL[format]}
          </div>
        ))}
        {listNames.map((listName) => (
          <FormatRow key={listName} listName={listName} cells={tournamentLegality} />
        ))}
      </div>
    </div>
  );
}

function FormatRow({ listName, cells }: { listName: string; cells: TournamentLegalityCell[] }) {
  return (
    <>
      <div>{listName}</div>
      {FORMATS.map((format) => {
        const cell = cells.find((c) => c.listName === listName && c.format === format);
        return (
          <div key={format} className={`font-semibold ${cell?.legal ? "text-success" : "text-danger"}`}>
            {cell?.legal ? "✓" : "✕"}
          </div>
        );
      })}
    </>
  );
}
