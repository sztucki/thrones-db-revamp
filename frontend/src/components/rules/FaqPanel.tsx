import { useEffect, useState } from "react";
import { FAQ_SECTIONS, FAQ_VERSION, type FaqSection } from "../../data/faq.js";
import { RULES_PROSE_CLASSES } from "./proseClasses.js";

function findSectionForId(id: string): FaqSection | undefined {
  return FAQ_SECTIONS.find((s) => s.html.includes(`id="${id}"`));
}

export function FaqPanel() {
  const [activeSection, setActiveSection] = useState<FaqSection>(FAQ_SECTIONS[0]);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingScrollId) return;
    const el = document.getElementById(pendingScrollId);
    el?.scrollIntoView({ block: "start" });
    setPendingScrollId(null);
  }, [pendingScrollId, activeSection]);

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const id = href.slice(1);
    const section = findSectionForId(id);
    if (!section) return;
    e.preventDefault();
    if (section !== activeSection) setActiveSection(section);
    setPendingScrollId(id);
  }

  return (
    <div>
      <div className="mb-1 text-[12px] text-textMuted">{FAQ_VERSION}</div>
      <div className="mb-4 flex flex-wrap gap-4 border-b border-border pb-3 text-[13px]">
        {FAQ_SECTIONS.map((s) => (
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
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: activeSection.html }}
      />
    </div>
  );
}
