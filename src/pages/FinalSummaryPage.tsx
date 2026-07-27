import { useRef } from "react";

import Button from "../components/Button";
import AppBackground from "../components/AppBackground";
import CharacterInformation from "../components/CharacterInformation";
import CharacterPortrait from "../components/CharacterPortrait";
import InterpretationComparison from "../components/InterpretationComparison";
import PrivilegeMargin from "../components/PrivilegeMargin";
import { getSituationContent } from "../engine/resolveSituationContent";

import type { Character } from "../types/character";
import type { ChoiceHistoryEntry } from "../types/choiceHistory";
import type { GameModeId } from "../types/gameMode";

interface Props {
  characters: Character[];
  initialCharacters: Character[];
  choiceHistory: ChoiceHistoryEntry[];
  selectedCharacterId: string;
  selectedModeId: GameModeId;
  totalExperiences: number;
  onRestart: () => void;
  onChooseAnotherCharacter: () => void;
  onBackHome: () => void;
}

export default function FinalSummaryPage({
  characters,
  initialCharacters,
  choiceHistory,
  selectedCharacterId,
  selectedModeId,
  totalExperiences,
  onRestart,
  onChooseAnotherCharacter,
  onBackHome,
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
    <AppBackground
      as="main"
      className="summary-background"
      style={{ "--character-accent": selectedCharacter?.color } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-[82rem] space-y-8 p-4 sm:p-8 lg:space-y-10 lg:px-8 lg:py-12 xl:px-6">
      <header className="mx-auto max-w-4xl space-y-5 text-center">
        <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
          Bilan de votre parcours
        </h1>

        <p className="text-lg text-slate-700">
          Ce bilan n&apos;est ni une note ni un jugement. Il propose de
          revenir sur les situations rencontrées et les choix effectués.
        </p>
        <p className="text-sm font-semibold text-slate-600">Mode : {selectedModeId === "discovery" ? "Découverte" : selectedModeId}</p>

        {selectedCharacter && (
          <div className="app-surface selected-character-card mx-auto flex w-full max-w-[34rem] items-center gap-5 rounded-2xl border p-4 pr-6 text-left">
            <CharacterPortrait
              characterId={selectedCharacter.id}
              characterName={selectedCharacter.name}
              size="summary"
              eager
              className="shrink-0"
            />
            <div>
              <p className="text-lg font-bold text-slate-900">{selectedCharacter.name}</p>
              <CharacterInformation character={selectedCharacter} compact className="mt-1" />
              <p className="mt-1 text-slate-700">
                {characters.find(({ id }) => id === selectedCharacterId)?.position ?? 0} pas effectués sur {totalExperiences}
              </p>
            </div>
          </div>
        )}
      </header>

      <PrivilegeMargin
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        totalExperiences={totalExperiences}
        realPositions={realPositions}
        className="mb-0"
        prominent
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-stretch">
        <section className="app-surface rounded-2xl border p-6 sm:p-7 lg:p-8">
          <h2 className="text-2xl font-bold text-slate-950">Nombre de pas effectués</h2>
          <p className="mt-4 leading-relaxed text-slate-700">
            Ces résultats correspondent au nombre d&apos;expériences du parcours où chaque personnage a pu avancer. Ils ne sont ni une note ni un jugement.
          </p>

          <ul className="mt-6">
            {characters.filter(({ id }) => id === selectedCharacterId).map((character) => (
              <li key={character.id} className="rounded-xl border border-slate-200 bg-slate-100 p-5">
                <p className="font-bold text-slate-950">{character.name}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {character.position} / {totalExperiences} selon vos réponses
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {realPositions[character.id]} / {totalExperiences} selon les situations
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="app-surface rounded-2xl border p-6 sm:p-7 lg:p-8">
          <h2 className="text-2xl font-bold text-slate-950">
            Une métaphore pour réfléchir
          </h2>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-700">
            La marche des privilèges est une métaphore pédagogique. Elle ne
            mesure ni la valeur des personnes ni une réalité individuelle :
            elle aide à discuter des expériences où certaines personnes peuvent
            avancer et d&apos;autres rester sur place.
          </p>
        </section>
      </div>

      <section
        ref={choicesSectionRef}
        tabIndex={-1}
        className="app-surface rounded-2xl border p-5 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:p-7 lg:p-8"
      >
        <h2 className="text-2xl font-bold">
          Récapitulatif de vos choix
        </h2>

        <ol className="mt-7 space-y-5">
          {choiceHistory.map(({ situation, expectedAnswerId, isCorrect, displacement }, index) => {
            const content = getSituationContent(situation, selectedCharacterId);
            const feedback = content.pedagogicalFeedback;
            const proposedObstacle = feedback?.obstacle ?? expectedAnswerId === "yes";
            const characterName = selectedCharacter?.name ?? "Le personnage";
            const playerInterpretation = displacement > 0 ? `${characterName} avance.` : `${characterName} reste sur place.`;
            const proposedInterpretation = proposedObstacle
              ? `Interprétation proposée : ${characterName} reste sur place.`
              : `Interprétation proposée : ${characterName} avance.`;
            const playerMovement = displacement > 0
              ? `${characterName} avance`
              : displacement < 0
                ? "Le personnage recule"
                : `${characterName} reste sur place`;
            const proposedMovement = proposedObstacle
              ? `${characterName} reste sur place`
              : `${characterName} avance`;

            return (
              <li key={situation.id}>
                <details open={index === 0} className="summary-detail group rounded-xl border">
                  <summary className="cursor-pointer list-none rounded-xl px-5 py-4 font-semibold marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                    <span className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                      <span>{index + 1}. {content.title}</span>
                      <span className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span className={`max-w-36 rounded-full border px-3 py-1 text-center text-xs font-semibold sm:max-w-none ${isCorrect ? "border-teal-200 bg-teal-50 text-teal-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>
                          <span aria-hidden="true">{isCorrect ? "≈ " : "↻ "}</span>
                          {isCorrect ? "Interprétation cohérente" : "Interprétation à reconsidérer"}
                        </span>
                        <span aria-hidden="true" className="text-xl group-open:rotate-45">+</span>
                      </span>
                    </span>
                  </summary>

                  <div className="space-y-6 border-t border-slate-300 px-5 py-5 text-slate-700">
                    <section>
                      <h3 className="font-bold text-slate-900">Situation</h3>
                      <p className="mt-1">{content.description}</p>
                    </section>

                    <section>
                      <h3 className="font-bold text-slate-900">Question</h3>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        Dans cette situation, que se passe-t-il pour {characterName}&nbsp;?
                      </p>
                    </section>

                    <InterpretationComparison
                      id={`comparison-${situation.id}`}
                      isCoherent={isCorrect}
                      playerInterpretation={playerInterpretation}
                      playerMovement={playerMovement}
                      proposedInterpretation={proposedInterpretation}
                      proposedMovement={proposedMovement}
                    />

                    {feedback?.explanation && (
                        <section className="pt-1">
                          <h3 className="flex items-center gap-2 font-bold text-indigo-900">
                            <span aria-hidden="true" className="text-lg">?</span>
                            Pourquoi&nbsp;?
                          </h3>
                          <p className="mt-2 leading-relaxed text-slate-700">{feedback.explanation}</p>
                        </section>
                    )}

                    {feedback?.takeaway && (
                        <section className="rounded-lg border border-violet-200 border-l-4 bg-violet-50/80 p-4">
                          <h3 className="flex items-center gap-2 font-bold text-violet-950">
                            <span aria-hidden="true">✦</span>
                            À retenir
                          </h3>
                          <p className="mt-2 leading-relaxed text-slate-700">{feedback.takeaway}</p>
                        </section>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="app-surface grid gap-5 rounded-2xl border p-6 sm:p-7 lg:grid-cols-[minmax(16rem,2fr)_minmax(0,3fr)] lg:gap-10 lg:p-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Questions pour poursuivre l&apos;échange
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            Ces questions peuvent servir de support à une discussion en groupe ou avec un formateur.
          </p>
        </div>

        <ul className="list-disc space-y-3 pl-5 leading-relaxed text-slate-700 lg:pt-1">
          <li>Qu&apos;est-ce qui a guidé vos choix dans ces situations ?</li>
          <li>Quels effets ces choix peuvent-ils avoir sur un groupe ?</li>
          <li>Quelles autres façons d&apos;agir pourriez-vous envisager ?</li>
        </ul>
      </section>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <Button onClick={onRestart}>Rejouer</Button>
        <Button variant="secondary" onClick={reviewChoices}>Revoir mes choix</Button>
        <Button variant="secondary" onClick={onChooseAnotherCharacter}>Changer de personnage</Button>
        <Button variant="ghost" onClick={onBackHome}>Retour à l&apos;accueil</Button>
      </div>
      </div>
    </AppBackground>
  );
}
