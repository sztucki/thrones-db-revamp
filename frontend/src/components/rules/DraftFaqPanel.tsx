import { useState } from "react";
import { DRAFT_FAQ_SECTIONS, DRAFT_FAQ_VERSION, type DraftFaqSection } from "../../data/draftFaq.js";
import { RULES_PROSE_CLASSES } from "./proseClasses.js";

export function DraftFaqPanel() {
  const [activeSection, setActiveSection] = useState<DraftFaqSection>(DRAFT_FAQ_SECTIONS[0]);

  return (
    <div>
      <div className="mb-1 text-[12px] text-textMuted">{DRAFT_FAQ_VERSION}</div>
      <div className="mb-4 flex flex-wrap gap-4 border-b border-border pb-3 text-[13px]">
        {DRAFT_FAQ_SECTIONS.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setActiveSection(s)}
            className={activeSection === s ? "font-semibold text-accent" : "text-textMuted hover:text-text"}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div
        className={`text-[13px] leading-relaxed text-textMuted ${RULES_PROSE_CLASSES}`}
        dangerouslySetInnerHTML={{ __html: activeSection.html }}
      />
    </div>
  );
}
