import { Link } from "react-router-dom";
import type { DeckFormat, RestrictedList } from "@thronesdb/shared";
import { RESTRICTED_LISTS } from "@thronesdb/shared";
import { useCardsByCode } from "../../hooks/useCardsByCode.js";

const FORMATS: DeckFormat[] = ["joust", "melee"];
const FORMAT_LABEL: Record<DeckFormat, string> = {
  joust: "Joust",
  melee: "Melee",
};

function tabButtonClasses(active: boolean) {
  return `rounded-sm border px-3 py-1.5 text-[13px] ${
    active
      ? "border-accent font-semibold text-text"
      : "border-border text-textMuted"
  }`;
}

function CardCode({ code, lookup }: { code: string; lookup: ReturnType<typeof useCardsByCode> }) {
  const card = lookup.get(code);
  if (!card) {
    return <span className="text-textMuted">{code}</span>;
  }
  return (
    <Link to={`/cards?q=${encodeURIComponent(card.name)}`} className="hover:underline">
      {card.name}
    </Link>
  );
}

export function RestrictedListPanel({
  selectedListCode,
  onSelectList,
  selectedFormat,
  onSelectFormat,
}: {
  selectedListCode: string;
  onSelectList: (code: string) => void;
  selectedFormat: DeckFormat;
  onSelectFormat: (format: DeckFormat) => void;
}) {
  const list: RestrictedList = RESTRICTED_LISTS.find((l) => l.code === selectedListCode) ?? RESTRICTED_LISTS[0];
  const format = list.formats.find((f) => f.name === selectedFormat);

  const bannedCodes = format ? [...new Set([...format.banned, ...list.bannedCards])] : list.bannedCards;
  const allCodes = format
    ? [...new Set([...format.restricted, ...bannedCodes, ...format.pods.flatMap((p) => p.cards)])]
    : bannedCodes;
  const lookup = useCardsByCode(allCodes);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {RESTRICTED_LISTS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onSelectList(l.code)}
              className={tabButtonClasses(l.code === selectedListCode)}
            >
              {l.name}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onSelectFormat(f)}
              className={tabButtonClasses(f === selectedFormat)}
            >
              {FORMAT_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-xs text-textMuted">
        {list.name} · effective {list.date}
      </div>

      {!format ? (
        <div className="text-sm text-textMuted">
          No restricted list data for {FORMAT_LABEL[selectedFormat]} under {list.name}.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <div className="mb-2 text-sm font-semibold">Restricted (max 1 per deck)</div>
            {format.restricted.length === 0 ? (
              <div className="text-sm text-textMuted">No cards on the restricted list.</div>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {format.restricted.map((code) => (
                  <li key={code}>
                    <CardCode code={code} lookup={lookup} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 text-sm font-semibold">Banned</div>
            {bannedCodes.length === 0 ? (
              <div className="text-sm text-textMuted">No banned cards.</div>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {bannedCodes.map((code) => (
                  <li key={code}>
                    <CardCode code={code} lookup={lookup} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 text-sm font-semibold">Cannot be used together</div>
            {format.pods.length === 0 ? (
              <div className="text-sm text-textMuted">No card combinations are restricted.</div>
            ) : (
              <ul className="flex flex-col gap-1 text-sm">
                {format.pods.map((pod, i) => (
                  <li key={i}>
                    {pod.cards.map((code, j) => (
                      <span key={code}>
                        {j > 0 && <span className="text-textMuted"> + </span>}
                        <CardCode code={code} lookup={lookup} />
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
