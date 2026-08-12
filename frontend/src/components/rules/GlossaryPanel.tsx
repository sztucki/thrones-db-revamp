import { useMemo, useState } from "react";
import {
  RULES_REFERENCE_APPENDIX_I,
  RULES_REFERENCE_COMPONENT_LIST,
  RULES_REFERENCE_GLOSSARY,
  RULES_REFERENCE_GOLDEN_RULES,
  RULES_REFERENCE_INTRODUCTION,
  type RulesReferenceEntry,
} from "../../data/rulesReference.js";
import { RULES_PROSE_CLASSES } from "./proseClasses.js";

const EXTRA_SECTIONS: { key: string; title: string; html: string }[] = [
  { key: "introduction", ...RULES_REFERENCE_INTRODUCTION },
  { key: "golden-rules", ...RULES_REFERENCE_GOLDEN_RULES },
  { key: "appendix-i", ...RULES_REFERENCE_APPENDIX_I },
  { key: "component-list", ...RULES_REFERENCE_COMPONENT_LIST },
];

const LETTERS = [...new Set(RULES_REFERENCE_GLOSSARY.map((e) => e.letter))].sort();

export function GlossaryPanel() {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState(LETTERS[0]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(RULES_REFERENCE_GLOSSARY[0]?.slug ?? null);
  const [selectedExtraKey, setSelectedExtraKey] = useState<string | null>(null);

  const trimmedQuery = query.trim().toLowerCase();
  const visibleTerms = useMemo(() => {
    if (trimmedQuery) {
      return RULES_REFERENCE_GLOSSARY.filter((e) => e.term.toLowerCase().includes(trimmedQuery));
    }
    return RULES_REFERENCE_GLOSSARY.filter((e) => e.letter === activeLetter);
  }, [trimmedQuery, activeLetter]);

  function selectTerm(entry: RulesReferenceEntry) {
    setSelectedSlug(entry.slug);
    setSelectedExtraKey(null);
  }

  function selectExtra(key: string) {
    setSelectedExtraKey(key);
    setSelectedSlug(null);
  }

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const slug = href.slice(1);
    const target = RULES_REFERENCE_GLOSSARY.find((entry) => entry.slug === slug);
    if (target) {
      e.preventDefault();
      selectTerm(target);
    }
  }

  const selected =
    selectedExtraKey != null
      ? EXTRA_SECTIONS.find((s) => s.key === selectedExtraKey)
      : RULES_REFERENCE_GLOSSARY.find((e) => e.slug === selectedSlug);

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap gap-3 text-[12px]">
        {EXTRA_SECTIONS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => selectExtra(s.key)}
            className={selectedExtraKey === s.key ? "font-semibold text-accent" : "text-textMuted hover:text-text"}
          >
            {s.title}
          </button>
        ))}
      </div>

      <input
        placeholder="Search glossary terms…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-[13px] text-text placeholder:text-textMuted"
      />

      {!trimmedQuery && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {LETTERS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLetter(l)}
              className={`min-w-[22px] text-[12px] ${
                activeLetter === l ? "font-semibold text-accent" : "text-textMuted hover:text-text"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        <div className="flex w-40 flex-none flex-col gap-1">
          {visibleTerms.length === 0 && <div className="text-[12px] text-textMuted">No matches.</div>}
          {visibleTerms.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => selectTerm(entry)}
              className={`rounded-sm px-2 py-1 text-left text-[13px] ${
                selectedSlug === entry.slug && !selectedExtraKey
                  ? "bg-surfaceHighlight font-semibold text-accent"
                  : "text-text hover:bg-surface"
              }`}
            >
              {entry.term}
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {selected ? (
            <div>
              <div className="mb-2 text-base font-bold">{"term" in selected ? selected.term : selected.title}</div>
              <div
                className={`text-[13px] leading-relaxed text-textMuted ${RULES_PROSE_CLASSES}`}
                onClick={handleContentClick}
                dangerouslySetInnerHTML={{ __html: selected.html }}
              />
            </div>
          ) : (
            <div className="text-sm text-textMuted">Select a term to see its rules text.</div>
          )}
        </div>
      </div>
    </div>
  );
}
