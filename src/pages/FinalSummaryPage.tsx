import { useRef } from "react";
import AppBackground from "../components/AppBackground";
import Button from "../components/Button";
import CharacterInformation from "../components/CharacterInformation";
import CharacterPortrait from "../components/CharacterPortrait";
import InterpretationComparison from "../components/InterpretationComparison";
import PrivilegeMargin from "../components/PrivilegeMargin";
import { movementDecisionToStep } from "../data/v2";
import type { ActiveGameModeIdV2 } from "../data/v2/activeModesRuntimeV2";
import type { CharacterIdV2 } from "../types/editorialV2";
import type { ChoiceHistoryEntryV2, GameCharacterV2 } from "../types/choiceHistory";
import type { RuntimeSituationV2 } from "../types/runtimeV2";
import { personalizePlayerText } from "../utils/personalizePlayerText";

interface Props { characters: readonly GameCharacterV2[]; initialCharacters: readonly GameCharacterV2[]; playedSituations: readonly RuntimeSituationV2[]; choiceHistory: readonly ChoiceHistoryEntryV2[]; selectedCharacterId: CharacterIdV2; selectedModeId: ActiveGameModeIdV2; onRestart: () => void; onChooseAnotherCharacter: () => void; onBackHome: () => void; }
const movement = (name: string, decision: "advance" | "stay") => `${name} ${decision === "advance" ? "avance" : "reste sur place"}`;
const modeLabels: Readonly<Record<ActiveGameModeIdV2, string>> = {
  "visible-obstacles": "Obstacles visibles",
  "ordinary-norms": "Normes ordinaires",
  "invisible-effects": "Effets invisibles",
};
const modeLabel = (modeId: ActiveGameModeIdV2) => modeLabels[modeId];
export default function FinalSummaryPage({ characters, initialCharacters, playedSituations, choiceHistory, selectedCharacterId, selectedModeId, onRestart, onChooseAnotherCharacter, onBackHome }: Props) {
  const choicesSectionRef = useRef<HTMLElement>(null);
  const selectedCharacter = initialCharacters.find(({ id }) => id === selectedCharacterId);
  const situationById = Object.fromEntries(playedSituations.map((situation) => [situation.id, situation]));
  const proposedPositions = Object.fromEntries(initialCharacters.map((character) => [character.id, playedSituations.reduce((position, situation) => {
    const decision = situation.movements[character.id];
    if (!decision) throw new Error(`Décision proposée absente : ${situation.id}/${character.id}`);
    return position + movementDecisionToStep(decision);
  }, 0)]));
  const concordanceCount = choiceHistory.filter(({ matchesProposedInterpretation }) => matchesProposedInterpretation).length;
  function reviewChoices() { choicesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); choicesSectionRef.current?.focus(); }
  return <AppBackground as="main" className="summary-background" style={{ "--character-accent": selectedCharacter?.accentColor } as React.CSSProperties}><div className="mx-auto w-full max-w-[82rem] space-y-8 p-4 sm:p-8 lg:space-y-10 lg:px-8 lg:py-12 xl:px-6">
    <header className="mx-auto max-w-4xl space-y-5 text-center"><h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">Bilan de votre parcours</h1><p className="text-lg text-slate-700">Ce bilan propose de revenir sur les situations rencontrées et de comparer votre lecture avec l’interprétation proposée.</p><p className="text-sm font-semibold text-slate-600">Mode : {modeLabel(selectedModeId)}</p>
      {selectedCharacter && <div className="app-surface selected-character-card mx-auto flex w-full max-w-[34rem] items-center gap-5 rounded-2xl border p-4 pr-6 text-left"><CharacterPortrait characterId={selectedCharacter.id} characterName={selectedCharacter.name} image={selectedCharacter.image} accentColor={selectedCharacter.accentColor} size="summary" eager className="shrink-0" /><div><p className="text-lg font-bold text-slate-900">{selectedCharacter.name}</p><CharacterInformation character={selectedCharacter} compact className="mt-1" /><p className="mt-1 text-slate-700">{characters.find(({ id }) => id === selectedCharacterId)?.position ?? 0} pas effectués sur {playedSituations.length}</p></div></div>}
    </header>
    <PrivilegeMargin characters={characters} selectedCharacterId={selectedCharacterId} totalExperiences={playedSituations.length} proposedPositions={proposedPositions} className="mb-0" prominent />
    <section className="app-surface rounded-2xl border p-6 sm:p-7 lg:p-8"><h2 className="text-2xl font-bold text-slate-950">Comparaison avec l’interprétation proposée</h2><p className="mt-4 leading-relaxed text-slate-700">Votre personnage a avancé dans {characters.find(({ id }) => id === selectedCharacterId)?.position ?? 0} situations selon vos réponses, et dans {proposedPositions[selectedCharacterId]} situations selon les interprétations proposées.</p><p className="mt-3 leading-relaxed text-slate-700">Votre lecture rejoint l’interprétation proposée dans {concordanceCount} situations sur {playedSituations.length}. Ce nombre sert à comparer les lectures proposées, et ne constitue pas une note morale.</p></section>
    <section ref={choicesSectionRef} tabIndex={-1} className="app-surface rounded-2xl border p-5 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:p-7 lg:p-8"><h2 className="text-2xl font-bold">Récapitulatif de vos réponses</h2><ol className="mt-7 space-y-5">
      {choiceHistory.map((entry, index) => { const situation = situationById[entry.situationId]; if (!situation) throw new Error(`Situation jouée introuvable : ${entry.situationId}`); const feedback = situation.feedback; const name = selectedCharacter?.name ?? "Le personnage"; return <li key={entry.situationId}><details open={index === 0} className="summary-detail group rounded-xl border"><summary className="cursor-pointer list-none rounded-xl px-5 py-4 font-semibold marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"><span className="flex items-start justify-between gap-3 sm:items-center"><span>{index + 1}. {personalizePlayerText(situation.title, name)}</span><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${entry.matchesProposedInterpretation ? "border-teal-200 bg-teal-50 text-teal-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}>{entry.matchesProposedInterpretation ? "Lecture concordante" : "Lecture différente"}</span></span></summary><div className="space-y-6 border-t border-slate-300 px-5 py-5 text-slate-700"><section><h3 className="font-bold text-slate-900">Situation</h3><p className="mt-1">{personalizePlayerText(situation.text, name)}</p></section><InterpretationComparison id={`comparison-${situation.id}`} isCoherent={entry.matchesProposedInterpretation} playerInterpretation={`Votre réponse : ${movement(name, entry.playerDecision)}.`} playerMovement={movement(name, entry.playerDecision)} proposedInterpretation={`Interprétation proposée : ${movement(name, entry.proposedDecision)}.`} proposedMovement={movement(name, entry.proposedDecision)} /><section><h3 className="font-bold text-indigo-900">Pourquoi pour {name}&nbsp;?</h3><p className="mt-2 leading-relaxed">{personalizePlayerText(feedback.explanation, name)}</p></section><section className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-4"><h3 className="font-bold text-indigo-950">Mécanisme en jeu :</h3><p className="mt-2">{personalizePlayerText(situation.mechanism, name)}</p></section>{situation.interpretation && <section><h3 className="font-bold text-slate-900">Interprétation pédagogique</h3><p className="mt-2 leading-relaxed">{personalizePlayerText(situation.interpretation, name)}</p></section>}{situation.vigilance && <section className="rounded-lg border border-amber-200 bg-amber-50/70 p-4"><h3 className="font-bold text-amber-950">Point de vigilance</h3><p className="mt-2">{personalizePlayerText(situation.vigilance, name)}</p></section>}</div></details></li>; })}
    </ol></section>
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4"><Button onClick={onRestart}>Rejouer</Button><Button variant="secondary" onClick={reviewChoices}>Revoir mes réponses</Button><Button variant="secondary" onClick={onChooseAnotherCharacter}>Changer de personnage</Button><Button variant="ghost" onClick={onBackHome}>Retour à l’accueil</Button></div>
  </div></AppBackground>;
}
