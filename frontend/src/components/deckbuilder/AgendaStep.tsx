import type { Card } from "@thronesdb/shared";

export function AgendaStep({
  houseName,
  agendas,
  selectedAgendaCode,
  onSelectAgenda,
  onStartBuilding,
}: {
  houseName: string;
  agendas: Card[];
  selectedAgendaCode: string | null;
  onSelectAgenda: (code: string | null) => void;
  onStartBuilding: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-7 py-10 text-center">
      <div className="mb-1 text-lg font-bold">New Deck — {houseName}</div>
      <div className="mb-7 text-[13px] text-textMuted">Step 2 of 2 — choose an agenda (optional)</div>

      <div className="mb-4 flex justify-center">
        <div
          onClick={() => onSelectAgenda(null)}
          className={`cursor-pointer rounded px-4 py-3 text-[13px] ${
            selectedAgendaCode === null ? "border-[1.5px] border-accent" : "border border-border"
          }`}
        >
          No agenda
        </div>
      </div>

      <div className="mb-7 grid max-h-72 grid-cols-4 gap-3 overflow-y-auto text-left">
        {agendas.map((a) => (
          <div
            key={a.code}
            onClick={() => onSelectAgenda(a.code)}
            className={`cursor-pointer overflow-hidden rounded ${
              selectedAgendaCode === a.code ? "border-[1.5px] border-accent" : "border border-border"
            }`}
          >
            <div className="h-14 bg-[repeating-linear-gradient(45deg,oklch(0.92_0.006_250),oklch(0.92_0.006_250)_8px,oklch(0.96_0.004_250)_8px,oklch(0.96_0.004_250)_16px)]" />
            <div className="rounded-b bg-bg p-2 text-[12px]">{a.name}</div>
          </div>
        ))}
      </div>

      <div
        onClick={onStartBuilding}
        className="inline-block cursor-pointer rounded border-[1.5px] border-accent px-6 py-2.5 text-sm font-medium text-accent"
      >
        Start building →
      </div>
    </div>
  );
}
