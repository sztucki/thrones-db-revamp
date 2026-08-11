import { useEffect } from "react";
import type { Card } from "@thronesdb/shared";

const ICON_LABELS: { key: keyof Card; label: string }[] = [
  { key: "isUnique", label: "Unique" },
  { key: "isLoyal", label: "Loyal" },
  { key: "isMilitary", label: "Military" },
  { key: "isIntrigue", label: "Intrigue" },
  { key: "isPower", label: "Power" },
];

const STAT_LABELS: { key: keyof Card; label: string }[] = [
  { key: "strength", label: "STR" },
  { key: "income", label: "Income" },
  { key: "initiative", label: "Initiative" },
  { key: "claim", label: "Claim" },
  { key: "reserve", label: "Reserve" },
];

export function CardDetailModal({ card, onClose }: { card: Card; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const icons = ICON_LABELS.filter(({ key }) => card[key]);
  const stats = STAT_LABELS.filter(({ key }) => card[key] !== null && card[key] !== undefined);

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={card.name}
        className="flex max-h-full w-[560px] max-w-full gap-5 overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-[200px] shrink-0 rounded object-cover object-top"
          />
        ) : (
          <div className="aspect-[15/14] w-[200px] shrink-0 rounded bg-[repeating-linear-gradient(45deg,oklch(0.92_0.006_250),oklch(0.92_0.006_250)_8px,oklch(0.96_0.004_250)_8px,oklch(0.96_0.004_250)_16px)]" />
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="text-lg font-semibold">{card.name}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-sm px-2 py-0.5 text-textMuted hover:text-text"
            >
              ✕
            </button>
          </div>

          <div className="mb-2 text-[12px] text-textMuted capitalize">
            {card.typeCode} · cost {card.cost ?? card.costRaw ?? "–"} · {card.factionCode}
          </div>

          {icons.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {icons.map(({ key, label }) => (
                <span
                  key={key}
                  className="rounded-sm border border-accent/40 bg-surfaceHighlight px-1.5 py-0.5 text-[11px] text-accent"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-textMuted">
              {stats.map(({ key, label }) => (
                <div key={key}>
                  {label}: <span className="text-text">{String(card[key])}</span>
                </div>
              ))}
            </div>
          )}

          {card.traits.length > 0 && (
            <div className="mb-3 text-[12px] text-textMuted">{card.traits.join(" · ")}</div>
          )}

          {card.text && (
            <div
              className="mb-3 rounded border border-border bg-bg p-3 text-[13px] whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: card.text }}
            />
          )}

          {card.flavor && (
            <div className="text-[12px] text-textMuted italic whitespace-pre-line">
              {card.flavor}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
