import { useEffect, useRef, useState } from "react";
import AppBackground from "../components/AppBackground";
import Button from "../components/Button";
import PrivilegeMargin from "../components/PrivilegeMargin";
import ProgressBar from "../components/ProgressBar";
import SituationCard from "../components/SituationCard";
import InterpretationComparison from "../components/InterpretationComparison";
import QuitGameDialog from "../components/QuitGameDialog";
import {
  createActiveGameSet,
  getActiveCharacter,
  getActiveCharactersForMode,
  getRevealedSituationFamilyLabel,
  preparePlayerSituation,
  type ActiveGameModeIdV2,
} from "../data/v2/activeModesRuntimeV2";
import {
  movementDecisionToStep,
} from "../data/v2";
import type { EditorialCharacterIdV2, MovementDecision } from "../types/editorialV2";
import type { ChoiceHistoryEntryV2, GameCharacterV2 } from "../types/choiceHistory";
import type { RuntimeGameSetV2 } from "../types/runtimeV2";
import { personalizePlayerText } from "../utils/personalizePlayerText";
import FinalSummaryPage from "./FinalSummaryPage";
import { saveActiveGame, type ActiveGameSnapshot, type GamePhase } from "../game/gameSession";

interface Props { initialGameSet: RuntimeGameSetV2; initialSnapshot?: ActiveGameSnapshot; selectedCharacterId: EditorialCharacterIdV2; selectedModeId: ActiveGameModeIdV2; onQuit: () => void; onChooseAnotherCharacter: () => void; onBackHome: () => void; backHomeLabel: string; }
const initialGameCharacters = (modeId: ActiveGameModeIdV2): GameCharacterV2[] =>
  getActiveCharactersForMode(modeId).map((character) => ({ ...character, position: 0 }));
const decisionLabel = (name: string, decision: MovementDecision) => `${name} ${decision === "advance" ? "avance" : "reste sur place"}`;

export default function GamePage({ initialGameSet, initialSnapshot, selectedCharacterId, selectedModeId, onQuit, onChooseAnotherCharacter, onBackHome, backHomeLabel }: Props) {
  const [gameSet, setGameSet] = useState(initialSnapshot?.gameSet ?? initialGameSet);
  const [currentIndex, setCurrentIndex] = useState(initialSnapshot?.currentIndex ?? 0);
  const [phase, setPhase] = useState<GamePhase>(initialSnapshot?.phase ?? "question");
  const [choiceHistory, setChoiceHistory] = useState<ChoiceHistoryEntryV2[]>(() => [...(initialSnapshot?.choiceHistory ?? [])]);
  const [characters, setCharacters] = useState<GameCharacterV2[]>(() => [...(initialSnapshot?.characters ?? initialGameCharacters(selectedModeId))]);
  const [detailsOpen, setDetailsOpen] = useState(initialSnapshot?.detailsOpen ?? false);
  const [quitConfirmationOpen, setQuitConfirmationOpen] = useState(false);
  const quitButtonRef = useRef<HTMLButtonElement>(null);
  const answerLockedRef = useRef(false);
  const continueLockedRef = useRef(false);
  const selectedCharacter = getActiveCharacter(selectedModeId, selectedCharacterId);
  const situation = gameSet.situations[currentIndex];

  useEffect(() => {
    if (phase === "end") return;
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(phase === "feedback" ? ".game-feedback h2" : ".situation-card h2");
      target?.setAttribute("tabindex", "-1");
      target?.focus({ preventScroll: true });
    });
  }, [currentIndex, phase]);

  useEffect(() => {
    saveActiveGame({ gameSet, selectedCharacterId, selectedModeId, currentIndex, phase, choiceHistory, characters, detailsOpen });
  }, [gameSet, selectedCharacterId, selectedModeId, currentIndex, phase, choiceHistory, characters, detailsOpen]);

  function requestQuit() {
    if (choiceHistory.length === 0) { onQuit(); return; }
    setQuitConfirmationOpen(true);
  }

  function cancelQuit() {
    setQuitConfirmationOpen(false);
    requestAnimationFrame(() => quitButtonRef.current?.focus({ preventScroll: true }));
  }

  function handleDecision(playerDecision: MovementDecision) {
    if (answerLockedRef.current) return;
    answerLockedRef.current = true;
    continueLockedRef.current = false;
    setDetailsOpen(false);
    const proposedDecision = situation.movements[selectedCharacterId];
    if (!proposedDecision) throw new Error(`Décision proposée absente : ${situation.id}/${selectedCharacterId}`);
    setCharacters((current) => current.map((character) => {
      const decision = character.id === selectedCharacterId ? playerDecision : situation.movements[character.id];
      if (!decision) throw new Error(`Décision proposée absente : ${situation.id}/${character.id}`);
      return { ...character, position: character.position + movementDecisionToStep(decision) };
    }));
    setChoiceHistory((history) => [...history, { situationId: situation.id, originMode: situation.originMode, playerDecision, proposedDecision, matchesProposedInterpretation: playerDecision === proposedDecision }]);
    setPhase("feedback");
  }

  function continueAfterFeedback() {
    if (continueLockedRef.current) return;
    continueLockedRef.current = true;
    if (currentIndex === gameSet.situations.length - 1) { setPhase("end"); return; }
    setCurrentIndex((index) => index + 1);
    answerLockedRef.current = false;
    setDetailsOpen(false);
    setPhase("question");
  }

  function restart() {
    answerLockedRef.current = false;
    continueLockedRef.current = false;
    setGameSet(createActiveGameSet(selectedModeId, selectedCharacterId));
    setCharacters(initialGameCharacters(selectedModeId));
    setCurrentIndex(0);
    setChoiceHistory([]);
    setDetailsOpen(false);
    setPhase("question");
  }

  if (phase === "end") return <FinalSummaryPage characters={characters} initialCharacters={initialGameCharacters(selectedModeId)} playedSituations={gameSet.situations} choiceHistory={choiceHistory} selectedCharacterId={selectedCharacterId} selectedModeId={selectedModeId} onRestart={restart} onChooseAnotherCharacter={onChooseAnotherCharacter} onBackHome={onBackHome} backHomeLabel={backHomeLabel} />;
  const latest = choiceHistory.at(-1);
  const feedback = phase === "feedback" ? situation.feedback : undefined;
  const playerSituation = preparePlayerSituation(situation);
  const selectedGameCharacter = characters.find(
    ({ id }) => id === selectedCharacterId,
  );
  const revealedFamilyLabel = phase === "feedback"
    ? getRevealedSituationFamilyLabel(selectedModeId, situation.originMode)
    : undefined;
  return <><AppBackground as="main" className="game-background" style={{ "--character-accent": selectedCharacter.accentColor } as React.CSSProperties}>
    <div className="mx-auto w-full max-w-[100rem] p-4 sm:p-8 lg:p-8 xl:p-10"><div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(25rem,2fr)]">
      <div id="privilege-margin" className="order-2 min-w-0 scroll-mt-4 lg:order-1"><PrivilegeMargin characters={characters} selectedCharacterId={selectedCharacterId} totalExperiences={gameSet.situations.length} currentSituation={currentIndex + 1} /></div>
      <aside className="app-surface situation-panel order-1 min-w-0 rounded-2xl border p-5 sm:p-6 lg:order-2 lg:sticky lg:top-6">
        <div className="game-active-actions"><button ref={quitButtonRef} type="button" onClick={requestQuit}>Quitter la partie</button></div>
        <section aria-label="Personnage incarné" className="mb-5 min-w-0 rounded-xl border border-slate-300 bg-white/80 p-4 lg:hidden">
          <p className="break-words font-bold" style={{ color: selectedCharacter.accentColor }}>{selectedCharacter.name}</p>
          <p className="mt-1 text-sm text-slate-700">Position actuelle : {selectedGameCharacter?.position ?? 0} / {gameSet.situations.length}</p>
          <a href="#privilege-margin" className="mt-3 inline-flex min-h-11 items-center rounded-lg font-semibold text-blue-700 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2">Voir la marche complète</a>
        </section>
        <ProgressBar current={currentIndex + 1} total={gameSet.situations.length} /><SituationCard situation={playerSituation} situationId={situation.id} characterName={selectedCharacter.name} showChoices={phase === "question"} onDecision={handleDecision} />
        {phase === "feedback" && latest && feedback && <section aria-live="polite" aria-atomic="true" className="game-feedback mt-6">
          <h2 className="text-2xl font-bold">Retour sur votre réponse</h2>
          <InterpretationComparison id={`game-comparison-${situation.id}`} isCoherent={latest.matchesProposedInterpretation} playerMovement={decisionLabel(selectedCharacter.name, latest.playerDecision)} proposedMovement={decisionLabel(selectedCharacter.name, latest.proposedDecision)} />
          <div className="game-feedback__next"><Button onClick={continueAfterFeedback}>{currentIndex === gameSet.situations.length - 1 ? "Voir le bilan" : "Situation suivante"}</Button></div>
          <div className="game-feedback__details"><h3><button type="button" id={`game-feedback-details-button-${situation.id}`} aria-expanded={detailsOpen} aria-controls={`game-feedback-details-${situation.id}`} onClick={() => setDetailsOpen((open) => !open)}><span>Comprendre cette situation</span><span aria-hidden="true">{detailsOpen ? "−" : "+"}</span></button></h3><div role="region" id={`game-feedback-details-${situation.id}`} aria-labelledby={`game-feedback-details-button-${situation.id}`} hidden={!detailsOpen} className="game-feedback__details-panel">
            {revealedFamilyLabel && <p className="game-feedback__focal"><strong>Focale :</strong> {revealedFamilyLabel}</p>}
            <section><h4>Pourquoi pour {selectedCharacter.name}&nbsp;?</h4><p>{personalizePlayerText(feedback.explanation, selectedCharacter.name)}</p></section>
            <section><h4>Mécanisme en jeu</h4><p>{personalizePlayerText(situation.mechanism, selectedCharacter.name)}</p></section>
            {situation.interpretation && <section><h4>Interprétation pédagogique</h4><p>{personalizePlayerText(situation.interpretation, selectedCharacter.name)}</p></section>}
            {situation.vigilance && <section><h4>Point de vigilance</h4><p>{personalizePlayerText(situation.vigilance, selectedCharacter.name)}</p></section>}
            {situation.intersectionalTest && <section><h4>Test intersectionnel</h4><p>{personalizePlayerText(situation.intersectionalTest, selectedCharacter.name)}</p></section>}
          </div></div>
        </section>}
      </aside>
    </div></div>
  </AppBackground>{quitConfirmationOpen && <QuitGameDialog onCancel={cancelQuit} onConfirm={onQuit} />}</>;
}
