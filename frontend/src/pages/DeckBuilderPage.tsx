import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "../hooks/useSession.js";
import { useFactions } from "../hooks/useFactions.js";
import { useCardSearch } from "../hooks/useCardSearch.js";
import { useCreateDeck, useDeck } from "../hooks/useDecks.js";
import { HouseStep } from "../components/deckbuilder/HouseStep.js";
import { AgendaStep } from "../components/deckbuilder/AgendaStep.js";
import { BuildStepLayout } from "../components/deckbuilder/BuildStepLayout.js";

function NewDeckWizard() {
  const navigate = useNavigate();
  const factionsQuery = useFactions();
  const agendasQuery = useCardSearch({ type: ["agenda"], limit: 100 });
  const createDeck = useCreateDeck();

  const [step, setStep] = useState<"house" | "agenda">("house");
  const [factionCode, setFactionCode] = useState<string | null>(null);
  const [agendaCode, setAgendaCode] = useState<string | null>(null);

  const factions = factionsQuery.data?.items ?? [];
  const houseName = factions.find((f) => f.code === factionCode)?.name ?? "";

  if (step === "house") {
    return (
      <HouseStep
        factions={factions}
        onSelect={(code) => {
          setFactionCode(code);
          setStep("agenda");
        }}
      />
    );
  }

  return (
    <AgendaStep
      houseName={houseName}
      agendas={agendasQuery.data?.items ?? []}
      selectedAgendaCode={agendaCode}
      onSelectAgenda={setAgendaCode}
      onStartBuilding={() => {
        if (!factionCode) return;
        createDeck.mutate(
          { name: `New ${houseName} Deck`, factionCode, agendaCode, format: "joust" },
          { onSuccess: (deck) => navigate(`/decks/${deck.id}/edit`, { replace: true }) }
        );
      }}
    />
  );
}

function EditDeck({ deckId }: { deckId: string }) {
  const deckQuery = useDeck(deckId);
  const factionsQuery = useFactions();

  if (deckQuery.isLoading) {
    return <div className="px-7 py-10 text-center text-sm text-textMuted">Loading deck…</div>;
  }
  if (deckQuery.isError || !deckQuery.data) {
    return <div className="px-7 py-10 text-center text-sm text-danger">Couldn't load this deck.</div>;
  }

  const houseName =
    factionsQuery.data?.items.find((f) => f.code === deckQuery.data.factionCode)?.name ??
    deckQuery.data.factionCode;

  return <BuildStepLayout deck={deckQuery.data} houseName={houseName} />;
}

export function DeckBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const sessionQuery = useSession();

  if (sessionQuery.data && !sessionQuery.data.user) {
    return (
      <div className="mx-auto max-w-3xl px-7 py-16 text-center text-sm text-textMuted">
        Log in to build a deck.
      </div>
    );
  }

  return id ? <EditDeck deckId={id} /> : <NewDeckWizard />;
}
