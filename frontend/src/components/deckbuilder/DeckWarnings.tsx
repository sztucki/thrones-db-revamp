import type { LegalityResult } from "@thronesdb/shared";

export function DeckWarnings({ legality }: { legality: LegalityResult }) {
  const items = [...legality.errors, ...legality.warnings];

  if (items.length === 0) {
    return (
      <div className="rounded border border-border p-2 text-center text-xs text-textMuted">No issues found</div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 rounded border border-border p-2">
      {legality.errors.map((msg, i) => (
        <div key={`e${i}`} className="text-xs text-danger">
          {msg}
        </div>
      ))}
      {legality.warnings.map((msg, i) => (
        <div key={`w${i}`} className="text-xs text-textMuted">
          {msg}
        </div>
      ))}
    </div>
  );
}
