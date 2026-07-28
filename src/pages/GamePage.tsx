import { useRef, useState } from "react";
import AppBackground from "../components/AppBackground";
import Button from "../components/Button";
import PrivilegeMargin from "../components/PrivilegeMargin";
import ProgressBar from "../components/ProgressBar";
import SituationCard from "../components/SituationCard";
import {
  createActiveGameSet,
  type ActiveGameModeIdV2,
} from "../data/v2/activeModesRuntimeV2";
import {
  getPlayableCharacterV2,
  movementDecisionToStep,
  playableCharactersV2,
} from "../data/v2";
import type { CharacterIdV2, MovementDecision } from "../types/editorialV2";
import type { ChoiceHistoryEntryV2, GameCharacterV2 } from "../types/choiceHistory";
import type { RuntimeGameSetV2 } from "../types/runtimeV2";
import { personalizePlayerText } from "../utils/personalizePlayerText";
import FinalSummaryPage from "./FinalSummaryPage";

type Phase = "question" | "feedback" | "end";
interface Props { initialGameSet: RuntimeGameSetV2; selectedCharacterId: CharacterIdV2; selectedModeId: ActiveGameModeIdV2; onChooseAnotherCharacter: () => void; onBackHome: () => void; }
const initialGameCharacters = (): GameCharacterV2[] => playableCharactersV2.map((character) => ({ ...character, position: 0 }));
const decisionLabel = (name: string, decision: MovementDecision) => `${name} ${decision === "advance" ? "avance" : "reste sur place"}`;

export default function GamePage({ initialGameSet, selectedCharacterId, selectedModeId, onChooseAnotherCharacter, onBackHome }: Props) {
  const [gameSet, setGameSet] = useState(initialGameSet);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [choiceHistory, setChoiceHistory] = useState<ChoiceHistoryEntryV2[]>([]);
  const [characters, setCharacters] = useState<GameCharacterV2[]>(initialGameCharacters);
  const answerLockedRef = useRef(false);
  const continueLockedRef = useRef(false);
  const selectedCharacter = getPlayableCharacterV2(selectedCharacterId);
  const situation = gameSet.situations[currentIndex];

  function handleDecision(playerDecision: MovementDecision) {
    if (answerLockedRef.current) return;
    answerLockedRef.current = true;
    continueLockedRef.current = false;
    const proposedDecision = situation.movements[selectedCharacterId];
    if (!proposedDecision) throw new Error(`Décision proposée absente : ${situation.id}/${selectedCharacterId}`);
    setCharacters((current) => current.map((character) => {
      const decision = character.id === selectedCharacterId ? playerDecision : situation.movements[character.id];
      if (!decision) throw new Error(`Décision proposée absente : ${situation.id}/${character.id}`);
      return { ...character, position: character.position + movementDecisionToStep(decision) };
    }));
    setChoiceHistory((history) => [...history, { situationId: situation.id, playerDecision, proposedDecision, matchesProposedInterpretation: playerDecision === proposedDecision }]);
    setPhase("feedback");
  }

  function continueAfterFeedback() {
    if (continueLockedRef.current) return;
    continueLockedRef.current = true;
    if (currentIndex === gameSet.situations.length - 1) { setPhase("end"); return; }
    setCurrentIndex((index) => index + 1);
    answerLockedRef.current = false;
    setPhase("question");
  }

  function restart() {
    answerLockedRef.current = false;
    continueLockedRef.current = false;
    setGameSet(createActiveGameSet(selectedModeId, selectedCharacterId));
    setCharacters(initialGameCharacters());
    setCurrentIndex(0);
    setChoiceHistory([]);
    setPhase("question");
  }

  if (phase === "end") return <FinalSummaryPage characters={characters} initialCharacters={initialGameCharacters()} playedSituations={gameSet.situations} choiceHistory={choiceHistory} selectedCharacterId={selectedCharacterId} selectedModeId={selectedModeId} onRestart={restart} onChooseAnotherCharacter={onChooseAnotherCharacter} onBackHome={onBackHome} />;
  const latest = choiceHistory.at(-1);
  const feedback = phase === "feedback" ? situation.feedback : undefined;
  return <AppBackground as="main" className="game-background" style={{ "--character-accent": selectedCharacter.accentColor } as React.CSSProperties}>
    <div className="mx-auto w-full max-w-[100rem] p-4 sm:p-8 lg:p-8 xl:p-10"><div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)] xl:grid-cols-[minmax(0,7fr)_minmax(22rem,3fr)]">
      <div className="min-w-0"><PrivilegeMargin characters={characters} selectedCharacterId={selectedCharacterId} totalExperiences={gameSet.situations.length} currentSituation={currentIndex + 1} /></div>
      <aside className="app-surface situation-panel min-w-0 rounded-2xl border p-5 sm:p-6 lg:sticky lg:top-6"><ProgressBar current={currentIndex + 1} total={gameSet.situations.length} /><SituationCard situation={situation} characterName={selectedCharacter.name} showChoices={phase === "question"} onDecision={handleDecision} />
        {phase === "feedback" && latest && feedback && <section aria-live="polite" aria-atomic="true" className="mt-6 space-y-4">
          <h2 className="text-2xl font-bold">Retour sur votre réponse</h2>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="font-bold text-blue-950">Votre réponse : {decisionLabel(selectedCharacter.name, latest.playerDecision)}.</p></div>
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4"><p className="font-bold text-teal-950">Interprétation proposée : {decisionLabel(selectedCharacter.name, latest.proposedDecision)}.</p></div>
          <p className={`rounded-xl border-l-4 p-4 font-semibold ${latest.matchesProposedInterpretation ? "border-violet-500 bg-violet-50 text-violet-950" : "border-amber-500 bg-amber-50 text-amber-950"}`}><span aria-hidden="true" className="mr-2">{latest.matchesProposedInterpretation ? "≈" : "↔"}</span>{latest.matchesProposedInterpretation ? "Votre lecture rejoint l’interprétation proposée." : "Votre lecture diffère de l’interprétation proposée. Voici le mécanisme retenu pour ce personnage."}</p>
          <Button onClick={continueAfterFeedback}>{currentIndex === gameSet.situations.length - 1 ? "Voir le bilan" : "Situation suivante"}</Button>
          <section><h3 className="font-bold text-slate-950">Pourquoi pour {selectedCharacter.name}&nbsp;?</h3><p className="mt-2 leading-relaxed text-slate-700">{personalizePlayerText(feedback.explanation, selectedCharacter.name)}</p></section>
          <section className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4"><h3 className="font-bold text-indigo-950">Mécanisme en jeu :</h3><p className="mt-2 leading-relaxed text-slate-700">{personalizePlayerText(situation.mechanism, selectedCharacter.name)}</p></section>
          {situation.interpretation && <section><h3 className="font-bold text-slate-950">Interprétation pédagogique</h3><p className="mt-2 leading-relaxed text-slate-700">{personalizePlayerText(situation.interpretation, selectedCharacter.name)}</p></section>}
          {situation.vigilance && <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-4"><h3 className="font-bold text-amber-950">Point de vigilance</h3><p className="mt-2 leading-relaxed text-slate-700">{personalizePlayerText(situation.vigilance, selectedCharacter.name)}</p></section>}
        </section>}
      </aside>
    </div></div>
  </AppBackground>;
}
