import { useRef } from "react";

import Button from "../components/Button";
import PrivilegeMargin from "../components/PrivilegeMargin";
import {
  getChoiceContent,
  getSituationContent,
} from "../engine/resolveSituationContent";

import type { Character } from "../types/character";
import type { ChoiceHistoryEntry } from "../types/choiceHistory";

interface Props {
  characters: Character[];
  initialCharacters: Character[];
  choiceHistory: ChoiceHistoryEntry[];
  selectedCharacterId: string;
  totalExperiences: number;
  onRestart: () => void;
  onChooseAnotherCharacter: () => void;
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
  const realPositions = Object.fromEntries(
    initialCharacters.map((character) => [
      character.id,
      choiceHistory.reduce((position, { choice }) => {
        const effect = choice.effects.find(({ characterId }) => characterId === character.id);
        return position + (effect?.displacement ?? 0);
      }, 0),
    ]),
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
        realPositions={realPositions}
      />

      <section className="mx-auto max-w-3xl rounded-xl border border-slate-300 bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">Nombre de pas effectués</h2>
        <p className="mt-3 text-slate-700">
          Ces résultats correspondent au nombre d&apos;expériences du parcours où chaque personnage a pu avancer. Ils ne sont ni une note ni un jugement.
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {characters.filter(({ id }) => id === selectedCharacterId).map((character) => (
            <li key={character.id} className="rounded-lg bg-slate-100 p-4">
              <p className="font-semibold">{character.name}</p>
              <p className="mt-1 text-lg">
                {character.position} / {totalExperiences} selon vos réponses
              </p>
              <p className="text-sm text-slate-600">
                {realPositions[character.id]} / {totalExperiences} selon les situations
              </p>
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

        <ol className="mt-6 space-y-4">
          {choiceHistory.map(({ situation, choice, expectedAnswerId }, index) => {
            const content = getSituationContent(situation, selectedCharacterId);
            const feedback = content.pedagogicalFeedback;

            return (
              <li key={situation.id}>
                <details open={index === 0} className="group rounded-xl border border-slate-300 bg-slate-50">
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      <span>{index + 1}. {content.title}</span>
                      <span aria-hidden="true" className="text-xl group-open:rotate-45">+</span>
                    </span>
                  </summary>

                  <div className="space-y-5 border-t border-slate-300 px-5 py-5 text-slate-700">
                    <section>
                      <h3 className="font-bold text-slate-900">Situation</h3>
                      <p className="mt-1">{content.description}</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-slate-900">Votre réponse</h3>
                      <p className="mt-1">{getChoiceContent(choice, selectedCharacterId).text}</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-slate-900">Pour ce personnage</h3>
                      <p className="mt-1">
                        {expectedAnswerId === "yes"
                          ? "Oui, cette situation constitue un obstacle."
                          : "Non, cette situation ne constitue pas un obstacle."}
                      </p>
                    </section>

                    {feedback?.explanation && (
                        <section>
                          <h3 className="font-bold text-slate-900">Pourquoi&nbsp;?</h3>
                          <p className="mt-1">{feedback.explanation}</p>
                        </section>
                    )}

                    {feedback?.schoolGoodPractice && (
                        <section>
                          <h3 className="font-bold text-slate-900">Que peut faire l’établissement&nbsp;?</h3>
                          <p className="mt-1">{feedback.schoolGoodPractice}</p>
                        </section>
                    )}

                    {feedback?.takeaway && (
                        <section className="rounded-lg bg-blue-50 p-4">
                          <h3 className="font-bold text-slate-900">À retenir</h3>
                          <p className="mt-1">{feedback.takeaway}</p>
                        </section>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
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
