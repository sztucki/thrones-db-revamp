import type { LegalityResult } from "@thronesdb/shared";

const FORMAT_LABEL: Record<LegalityResult["format"], string> = {
  joust: "Joust",
  melee: "Melee",
};

export function LegalityBox({ legality }: { legality: LegalityResult }) {
  return (
    <div className="mb-4 rounded border border-border bg-bg p-3">
      <div className="mb-2 text-xs font-semibold">Tournament Legality — {FORMAT_LABEL[legality.format]}</div>
      <div className="mb-1.5 flex items-center gap-2 text-xs">
        <span className={legality.legal ? "text-success" : "text-danger"}>{legality.legal ? "✓" : "✕"}</span>
        <span className={legality.legal ? "text-success" : "text-danger"}>
          {legality.legal ? "Legal for tournament play" : "Not currently legal"}
        </span>
      </div>
      <div className="text-[11px] text-textMuted">
        Draw {legality.drawCount}/{legality.requiredDraw} · Plot {legality.plotCount}/{legality.requiredPlots}
      </div>
    </div>
  );
}
