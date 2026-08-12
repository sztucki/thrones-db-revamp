import { useSearchParams } from "react-router-dom";
import type { DeckFormat } from "@thronesdb/shared";
import { RESTRICTED_LISTS } from "@thronesdb/shared";
import { DraftFaqPanel } from "../components/rules/DraftFaqPanel.js";
import { FaqPanel } from "../components/rules/FaqPanel.js";
import { GlossaryPanel } from "../components/rules/GlossaryPanel.js";
import { RestrictedListPanel } from "../components/rules/RestrictedListPanel.js";
import { TournamentRegulationsPanel } from "../components/rules/TournamentRegulationsPanel.js";

const TABS = [
  { key: "reference", label: "Rules Reference" },
  { key: "faq", label: "F.A.Q." },
  { key: "draft-faq", label: "Draft F.A.Q." },
  { key: "restrictions", label: "Restrictions" },
  { key: "tournament", label: "Tournament Regulations" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function RulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (TABS.find((t) => t.key === searchParams.get("tab"))?.key ?? "reference") as TabKey;
  const selectedListCode = searchParams.get("list") ?? RESTRICTED_LISTS[0].code;
  const selectedFormat: DeckFormat = searchParams.get("format") === "melee" ? "melee" : "joust";

  function setTab(tab: TabKey) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  }

  function setListCode(code: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("list", code);
      return next;
    });
  }

  function setFormat(format: DeckFormat) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("format", format);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-7 py-10">
      <div className="mb-4 text-lg font-bold">Rules</div>
      <div className="mb-6 flex flex-wrap gap-0 border-b border-border text-[13px]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setTab(tab.key)}
            className={`border-b-2 px-3.5 py-2 ${
              activeTab === tab.key
                ? "border-accent font-semibold text-text"
                : "border-transparent text-textMuted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "reference" && <GlossaryPanel />}
      {activeTab === "faq" && <FaqPanel />}
      {activeTab === "restrictions" && (
        <RestrictedListPanel
          selectedListCode={selectedListCode}
          onSelectList={setListCode}
          selectedFormat={selectedFormat}
          onSelectFormat={setFormat}
        />
      )}
      {activeTab === "tournament" && <TournamentRegulationsPanel />}
      {activeTab === "draft-faq" && <DraftFaqPanel />}
    </div>
  );
}
