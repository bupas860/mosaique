import { useRef } from "react";

import Button from "../components/Button";
import PrivilegeMargin from "../components/PrivilegeMargin";
import VisualMedia from "../components/VisualMedia";
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
          <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-slate-300 bg-white py-2 pl-2 pr-5 text-left shadow-sm">
            <VisualMedia
              src={selectedCharacter.profile.avatar?.src}
              alt={selectedCharacter.profile.avatar?.alt ?? `Portrait de ${selectedCharacter.name}`}
              fallbackLabel={selectedCharacter.name.charAt(0).toUpperCase()}
              className="h-12 w-12 shrink-0 rounded-full text-xl"
            />
            <p className="text-slate-700">
              Vous avez incarné <strong className="text-slate-900">{selectedCharacter.name}</strong>.
            </p>
          </div>
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
          {choiceHistory.map(({ situation, choice, expectedAnswerId, isCorrect, displacement }, index) => {
            const content = getSituationContent(situation, selectedCharacterId);
            const feedback = content.pedagogicalFeedback;
            const movementLabel = displacement > 0
              ? "Le personnage avance"
              : displacement < 0
                ? "Le personnage recule"
                : "Le personnage reste sur place";
            const movementClasses = displacement > 0
              ? "border-teal-300 bg-teal-50 text-teal-900"
              : displacement < 0
                ? "border-red-300 bg-red-50 text-red-900"
                : "border-amber-300 bg-amber-50 text-amber-950";

            return (
              <li key={situation.id}>
                <details open={index === 0} className="group rounded-xl border border-slate-300 bg-slate-50">
                  <summary className="cursor-pointer list-none px-5 py-4 font-semibold marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      <span>{index + 1}. {content.title}</span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isCorrect ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
                          {isCorrect ? "✓ Réponse adaptée" : "! Réponse à questionner"}
                        </span>
                        <span aria-hidden="true" className="text-xl group-open:rotate-45">+</span>
                      </span>
                    </span>
                  </summary>

                  <div className="space-y-5 border-t border-slate-300 px-5 py-5 text-slate-700">
                    <section>
                      <h3 className="font-bold text-slate-900">Situation</h3>
                      <p className="mt-1">{content.description}</p>
                    </section>

                    <section className={`rounded-lg border p-4 ${isCorrect ? "border-green-300 bg-green-50 text-green-950" : "border-red-300 bg-red-50 text-red-950"}`}>
                      <h3 className="font-bold">Votre réponse</h3>
                      <p className="mt-1 text-lg font-semibold">{getChoiceContent(choice, selectedCharacterId).text}</p>
                      <p className="mt-2 text-sm font-bold">
                        {isCorrect ? "✓ Réponse adaptée" : "! Réponse à questionner"}
                      </p>
                    </section>

                    <section className={`rounded-lg border p-4 ${movementClasses}`}>
                      <h3 className="font-bold">Effet sur le déplacement</h3>
                      <p className="mt-1 text-lg font-semibold">{movementLabel}</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-slate-900">Feedback pédagogique</h3>
                      <p className="mt-1">
                        {(feedback?.obstacle ?? expectedAnswerId === "yes")
                          ? "Cette situation constitue un obstacle pour ce personnage."
                          : "Cette situation ne constitue pas un obstacle pour ce personnage."}
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
