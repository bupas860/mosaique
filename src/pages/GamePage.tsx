import { useRef, useState } from "react";

import SituationCard from "../components/SituationCard";
import AppBackground from "../components/AppBackground";
import Button from "../components/Button";
import PrivilegeMargin from "../components/PrivilegeMargin";
import ProgressBar from "../components/ProgressBar";
import FinalSummaryPage from "./FinalSummaryPage";

import { playableCharacters as initialCharacters, situations } from "../data";

import { applyEffects } from "../engine/applyEffects";
import {
  getSituationContent,
  getSituationsForCharacter,
} from "../engine/resolveSituationContent";
import type { ChoiceHistoryEntry } from "../types/choiceHistory";
import type { Choice } from "../types/situation";
import type { GameModeId } from "../types/gameMode";

type Phase = "question" | "feedback" | "end";
const MAX_SITUATIONS_PER_GAME = 10;
const AVAILABLE_SITUATION_IDS = new Set(
  Array.from({ length: 20 }, (_, index) => `S${String(index + 1).padStart(2, "0")}`),
);
// TEMPORARY: set to false to restore the fully random draw after the S01 illustration test.
const FORCE_S01_FIRST_FOR_ILLUSTRATION_TEST = true;

function selectSituationsForGame(allSituations: typeof situations) {
  const availableSituations = allSituations.filter(({ id }) =>
    AVAILABLE_SITUATION_IDS.has(id)
  );
  const firstSituation = FORCE_S01_FIRST_FOR_ILLUSTRATION_TEST
    ? availableSituations.find(({ id }) => id === "S01")
    : undefined;
  const shuffled = firstSituation
    ? availableSituations.filter(({ id }) => id !== firstSituation.id)
    : availableSituations;

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return firstSituation
    ? [firstSituation, ...shuffled.slice(0, MAX_SITUATIONS_PER_GAME - 1)]
    : shuffled.slice(0, MAX_SITUATIONS_PER_GAME);
}

interface Props {
  selectedCharacterId: string;
  selectedModeId: GameModeId;
  onChooseAnotherCharacter: () => void;
  onBackHome: () => void;
}

export default function GamePage({
  selectedCharacterId,
  selectedModeId,
  onChooseAnotherCharacter,
  onBackHome,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [choiceHistory, setChoiceHistory] = useState<ChoiceHistoryEntry[]>([]);
  const answerLockedRef = useRef(false);
  const continueLockedRef = useRef(false);
  const [characterSituations, setCharacterSituations] = useState(() =>
    selectSituationsForGame(
      getSituationsForCharacter(situations, selectedCharacterId),
    )
  );

  const [characters, setCharacters] = useState(() =>
    initialCharacters.map((character) => ({ ...character }))
  );

  const selectedCharacter = initialCharacters.find(
    (character) => character.id === selectedCharacterId,
  );
  const situation = characterSituations[currentIndex];

  function handleChoice(choice: Choice) {
    if (answerLockedRef.current) {
      return;
    }

    answerLockedRef.current = true;
    continueLockedRef.current = false;
    const selectedEffect = choice.effects.find(
      ({ characterId }) => characterId === selectedCharacterId,
    );
    const expectedAnswerId = selectedEffect?.displacement === 0 ? "yes" : "no";
    const playerDisplacement = choice.id === "no" ? 1 : 0;
    const playerEffects = choice.effects.map((effect) =>
      effect.characterId === selectedCharacterId
        ? { ...effect, displacement: playerDisplacement }
        : effect
    );

    setCharacters((currentCharacters) =>
      applyEffects(currentCharacters, playerEffects)
    );

    setChoiceHistory((history) => [
      ...history,
      {
        situation,
        choice,
        expectedAnswerId,
        isCorrect: choice.id === expectedAnswerId,
        displacement: playerDisplacement,
      },
    ]);
    setPhase("feedback");
  }

  function continueAfterFeedback() {
    if (continueLockedRef.current) return;
    continueLockedRef.current = true;

    if (currentIndex === characterSituations.length - 1) {
      setPhase("end");
      return;
    }

    setCurrentIndex((index) => index + 1);
    answerLockedRef.current = false;
    setPhase("question");
  }

  function restart() {
    answerLockedRef.current = false;
    continueLockedRef.current = false;
    setCharacters(
      initialCharacters.map((character) => ({ ...character }))
    );

    setCurrentIndex(0);
    setChoiceHistory([]);
    setCharacterSituations(selectSituationsForGame(
      getSituationsForCharacter(situations, selectedCharacterId),
    ));
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
        selectedModeId={selectedModeId}
        totalExperiences={characterSituations.length}
        onRestart={restart}
        onChooseAnotherCharacter={onChooseAnotherCharacter}
        onBackHome={onBackHome}
      />
    );
  }

  return (
    <AppBackground
      as="main"
      className="game-background"
      style={{ "--character-accent": selectedCharacter?.color } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-[100rem] p-4 sm:p-8 lg:p-8 xl:p-10">
        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] xl:grid-cols-[minmax(0,7fr)_minmax(22rem,3fr)]">
        <div className="min-w-0">
          <PrivilegeMargin
            characters={characters}
            selectedCharacterId={selectedCharacterId}
            totalExperiences={characterSituations.length}
            currentSituation={currentIndex + 1}
          />
        </div>

        <aside className="app-surface situation-panel min-w-0 rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-6">
          <ProgressBar
            current={currentIndex + 1}
            total={characterSituations.length}
          />

          <SituationCard
              content={getSituationContent(situation, selectedCharacterId)}
              situationId={situation.id}
              choices={situation.choices}
              characterName={selectedCharacter?.name ?? "Le personnage"}
              showChoices={phase === "question"}
              onChoice={handleChoice}
            />
          {phase === "feedback" && (() => {
            const answer = choiceHistory.at(-1);
            const playerAdvance = answer?.choice.id === "no";
            const proposedAdvance = answer?.expectedAnswerId === "no";
            const readingsMatch = playerAdvance === proposedAdvance;
            const feedback = getSituationContent(situation, selectedCharacterId).pedagogicalFeedback;
            const characterName = selectedCharacter?.name ?? "Le personnage";
            return <section aria-live="polite" aria-atomic="true" className="mt-6 space-y-4">
              <h2 className="text-2xl font-bold">Retour sur votre choix</h2>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="font-bold text-blue-950">Votre choix : {characterName} {playerAdvance ? "avance" : "reste sur place"}.</p></div>
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4"><p className="font-bold text-teal-950">Interprétation proposée : {characterName} {proposedAdvance ? "avance" : "reste sur place"}.</p></div>
              <p className={"rounded-xl border-l-4 p-4 font-semibold " + (readingsMatch ? "border-violet-500 bg-violet-50 text-violet-950" : "border-amber-500 bg-amber-50 text-amber-950")}><span aria-hidden="true" className="mr-2">{readingsMatch ? "≈" : "↔"}</span>{readingsMatch ? "Votre lecture rejoint l’interprétation proposée." : "Votre lecture diffère de l’interprétation proposée."}</p>
              {feedback?.explanation && <p className="leading-relaxed text-slate-700">{feedback.explanation}</p>}
              <Button onClick={continueAfterFeedback}>{currentIndex === characterSituations.length - 1 ? "Voir le bilan" : "Situation suivante"}</Button>
            </section>;
          })()}
        </aside>
        </div>
      </div>
    </AppBackground>
  );
}
