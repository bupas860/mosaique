import { useState } from "react";

import SituationCard from "../components/SituationCard";
import FeedbackCard from "../components/FeedbackCard";
import Button from "../components/Button";
import PrivilegeMargin from "../components/PrivilegeMargin";
import ProgressBar from "../components/ProgressBar";
import FinalSummaryPage from "./FinalSummaryPage";

import { playableCharacters as initialCharacters, situations } from "../content";

import { applyEffects } from "../engine/applyEffects";
import {
  getChoiceContent,
  getSituationContent,
  getSituationsForCharacter,
} from "../engine/resolveSituationContent";
import type { ChoiceHistoryEntry } from "../types/choiceHistory";
import type { Choice } from "../types/situation";

type Phase = "question" | "feedback" | "end";

interface Props {
  selectedCharacterId: string;
  onChooseAnotherCharacter: () => void;
}

export default function GamePage({
  selectedCharacterId,
  onChooseAnotherCharacter,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [feedback, setFeedback] = useState("");
  const [choiceHistory, setChoiceHistory] = useState<ChoiceHistoryEntry[]>([]);

  const [characters, setCharacters] = useState(() =>
    initialCharacters.map((character) => ({ ...character }))
  );

  const selectedCharacter = initialCharacters.find(
    (character) => character.id === selectedCharacterId,
  );
  const characterSituations = getSituationsForCharacter(
    situations,
    selectedCharacterId,
  );
  const situation = characterSituations[currentIndex];

  function handleChoice(choice: Choice) {

    setCharacters((currentCharacters) =>
      applyEffects(currentCharacters, choice.effects)
    );

    setChoiceHistory((history) => [
      ...history,
      { situation, choice },
    ]);
    setFeedback(getChoiceContent(choice, selectedCharacterId).feedback);
    setPhase("feedback");
  }

  function handleContinue() {
    if (currentIndex < characterSituations.length - 1) {
      setCurrentIndex((index) => index + 1);
      setPhase("question");
      return;
    }

    setPhase("end");
  }

  function restart() {
    setCharacters(
      initialCharacters.map((character) => ({ ...character }))
    );

    setCurrentIndex(0);
    setFeedback("");
    setChoiceHistory([]);
    setPhase("question");
  }

  if (characterSituations.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6 sm:p-8">
        <section className="w-full space-y-5 rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Parcours en préparation</h1>
          <p className="text-slate-700">
            Les premières expériences de {selectedCharacter?.name ?? "ce personnage"} ne sont pas encore disponibles.
          </p>
          <Button onClick={onChooseAnotherCharacter}>Choisir un autre personnage</Button>
        </section>
      </main>
    );
  }

  if (phase === "end") {
    return (
      <FinalSummaryPage
        characters={characters}
        initialCharacters={initialCharacters}
        choiceHistory={choiceHistory}
        selectedCharacterId={selectedCharacterId}
        totalExperiences={characterSituations.length}
        onRestart={restart}
        onChooseAnotherCharacter={onChooseAnotherCharacter}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-8 lg:p-12">

      <PrivilegeMargin
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        totalExperiences={characterSituations.length}
      />

      <div className="mx-auto max-w-3xl">
        <ProgressBar
          current={currentIndex + 1}
          total={characterSituations.length}
        />

        {phase === "question" && (
          <SituationCard
            content={getSituationContent(situation, selectedCharacterId)}
            choices={situation.choices}
            characterId={selectedCharacterId}
            onChoice={handleChoice}
          />
        )}

        {phase === "feedback" && (
          <FeedbackCard
            feedback={feedback}
            characterName={selectedCharacter?.name ?? "ce personnage"}
            onContinue={handleContinue}
          />
        )}
      </div>

    </main>
  );
}
