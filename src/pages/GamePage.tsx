import { useEffect, useRef, useState } from "react";

import SituationCard from "../components/SituationCard";
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

type Phase = "question" | "transition" | "end";
const MAX_SITUATIONS_PER_GAME = 10;
const SITUATION_TRANSITION_DELAY_MS = 400;

function selectSituationsForGame(allSituations: typeof situations) {
  const shuffled = [...allSituations];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, MAX_SITUATIONS_PER_GAME);
}

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
  const [choiceHistory, setChoiceHistory] = useState<ChoiceHistoryEntry[]>([]);
  const answerLockedRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
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

  useEffect(() => () => {
    if (transitionTimerRef.current !== undefined) {
      clearTimeout(transitionTimerRef.current);
    }
  }, []);

  function handleChoice(choice: Choice) {
    if (answerLockedRef.current) {
      return;
    }

    answerLockedRef.current = true;
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
      },
    ]);
    setPhase("transition");
    transitionTimerRef.current = setTimeout(() => {
      transitionTimerRef.current = undefined;

      if (currentIndex < characterSituations.length - 1) {
        setCurrentIndex((index) => index + 1);
        answerLockedRef.current = false;
        setPhase("question");
        return;
      }

      setPhase("end");
    }, SITUATION_TRANSITION_DELAY_MS);
  }

  function restart() {
    if (transitionTimerRef.current !== undefined) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = undefined;
    }
    answerLockedRef.current = false;
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
        totalExperiences={characterSituations.length}
        onRestart={restart}
        onChooseAnotherCharacter={onChooseAnotherCharacter}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-[100rem] p-4 sm:p-8 lg:p-8 xl:p-10">
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] xl:grid-cols-[minmax(0,7fr)_minmax(22rem,3fr)]">
        <div className="min-w-0">
          <PrivilegeMargin
            characters={characters}
            selectedCharacterId={selectedCharacterId}
            totalExperiences={characterSituations.length}
          />
        </div>

        <aside className="min-w-0 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
          <ProgressBar
            current={currentIndex + 1}
            total={characterSituations.length}
          />

          {(phase === "question" || phase === "transition") && (
            <SituationCard
              content={getSituationContent(situation, selectedCharacterId)}
              choices={situation.choices}
              characterId={selectedCharacterId}
              disabled={phase === "transition"}
              onChoice={handleChoice}
            />
          )}
        </aside>
      </div>
    </main>
  );
}
