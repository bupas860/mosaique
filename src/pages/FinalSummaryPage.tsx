import { useRef } from "react";

import Button from "../components/Button";
import PrivilegeMargin from "../components/PrivilegeMargin";
import {
  getChoiceContent,
  getSituationContent,
} from "../engine/resolveSituationContent";

import type { Character } from "../types/character";
import type { ChoiceHistoryEntry } from "../types/choiceHistory";
import type { Choice } from "../types/situation";

interface Props {
  characters: Character[];
  initialCharacters: Character[];
  choiceHistory: ChoiceHistoryEntry[];
  selectedCharacterId: string;
  totalExperiences: number;
  onRestart: () => void;
  onChooseAnotherCharacter: () => void;
}

function formatAdvancement(choice: Choice, characters: Character[]) {
  const names = choice.effects
    .filter((effect) => effect.displacement === 1)
    .map((effect) => characters.find(({ id }) => id === effect.characterId)?.name)
    .filter((name): name is string => name !== undefined);

  if (names.length === 0) {
    return "Aucun personnage n'avance lors de cette expérience.";
  }

  if (names.length === 1) {
    return `${names[0]} avance d'un pas lors de cette expérience.`;
  }

  return `${names.slice(0, -1).join(", ")} et ${names.at(-1)} avancent chacun d'un pas lors de cette expérience.`;
}

export default function FinalSummaryPage({
  characters,
  initialCharacters,
  choiceHistory,
  selectedCharacterId,
  totalExperiences,
  onRestart,
  onChooseAnotherCharacter,
}: Props) {
  const choicesSectionRef = useRef<HTMLElement>(null);
  const selectedCharacter = initialCharacters.find(
    (character) => character.id === selectedCharacterId,
  );

  function reviewChoices() {
    choicesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    choicesSectionRef.current?.focus();
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-8 lg:p-12">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">
          Bilan de votre parcours
        </h1>

        <p className="text-lg text-slate-700">
          Ce bilan n&apos;est ni une note ni un jugement. Il propose de
          revenir sur les situations rencontrées et les choix effectués.
        </p>

        {selectedCharacter && (
          <p className="text-slate-700">
            Vous avez incarné {selectedCharacter.name} pendant ce parcours.
          </p>
        )}
      </header>

      <PrivilegeMargin
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        totalExperiences={totalExperiences}
      />

      <section className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">Nombre de pas effectués</h2>
        <p className="mt-3 text-slate-700">
          Ces résultats correspondent au nombre d&apos;expériences du parcours où chaque personnage a pu avancer. Ils ne sont ni une note ni un jugement.
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {characters.map((character) => (
            <li key={character.id} className="rounded-lg bg-slate-100 p-4">
              <p className="font-semibold">{character.name}</p>
              <p className="mt-1 text-lg">
                {character.position} / {totalExperiences}
              </p>
              <p className="text-sm text-slate-600">pas effectués</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">
          Une métaphore pour réfléchir
        </h2>

        <p className="mt-4 text-slate-700">
          La marge des privilèges est une métaphore pédagogique. Elle ne
          mesure ni la valeur des personnes ni une réalité individuelle :
          elle aide à discuter des expériences où certaines personnes peuvent
          avancer et d&apos;autres rester sur place.
        </p>
      </section>

      <section
        ref={choicesSectionRef}
        tabIndex={-1}
        className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 shadow focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        <h2 className="text-2xl font-bold">
          Récapitulatif de vos choix
        </h2>

        <ol className="mt-6 space-y-6">
          {choiceHistory.map(({ situation, choice }, index) => (
            <li key={situation.id} className="border-l-4 border-blue-600 pl-4">
              <p className="font-semibold">
                {index + 1}. {getSituationContent(situation, selectedCharacterId).title}
              </p>
              <p className="mt-2 text-slate-700">
                Votre choix : {getChoiceContent(choice, selectedCharacterId).text}
              </p>
              <p className="mt-2 text-slate-700">
                {formatAdvancement(choice, initialCharacters)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">
          Questions pour poursuivre l&apos;échange
        </h2>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
          <li>Qu&apos;est-ce qui a guidé vos choix dans ces situations ?</li>
          <li>Quels effets ces choix peuvent-ils avoir sur un groupe ?</li>
          <li>Quelles autres façons d&apos;agir pourriez-vous envisager ?</li>
        </ul>
      </section>

      <div className="flex flex-wrap justify-center gap-4">
        <Button onClick={reviewChoices}>Revoir mes choix</Button>
        <Button onClick={onRestart}>Rejouer</Button>
        <Button onClick={onChooseAnotherCharacter}>Changer de personnage</Button>
      </div>
    </main>
  );
}
