import { useEffect, useState } from "react";
import AppBackground from "../components/AppBackground";
import Button from "../components/Button";
import CharacterInformation from "../components/CharacterInformation";
import CharacterPortrait from "../components/CharacterPortrait";
import InterpretationComparison from "../components/InterpretationComparison";
import PrivilegeMargin from "../components/PrivilegeMargin";
import { movementDecisionToStep } from "../data/v2";
import { getRevealedSituationFamilyLabel, summarizeDiscoveryChoices, type ActiveGameModeIdV2 } from "../data/v2/activeModesRuntimeV2";
import type { EditorialCharacterIdV2 } from "../types/editorialV2";
import type { ChoiceHistoryEntryV2, GameCharacterV2 } from "../types/choiceHistory";
import type { RuntimeSituationV2 } from "../types/runtimeV2";
import { personalizePlayerText } from "../utils/personalizePlayerText";

interface Props { characters: readonly GameCharacterV2[]; initialCharacters: readonly GameCharacterV2[]; playedSituations: readonly RuntimeSituationV2[]; choiceHistory: readonly ChoiceHistoryEntryV2[]; selectedCharacterId: EditorialCharacterIdV2; selectedModeId: ActiveGameModeIdV2; onRestart: () => void; onChooseAnotherCharacter: () => void; onBackHome: () => void; backHomeLabel: string; }
const movement = (name: string, decision: "advance" | "stay") => `${name} ${decision === "advance" ? "avance" : "reste sur place"}`;
const modeLabels: Readonly<Record<ActiveGameModeIdV2, string>> = { discovery: "Découverte", "visible-obstacles": "Obstacles visibles", "ordinary-norms": "Normes ordinaires", "invisible-effects": "Effets invisibles", intersectionalities: "Intersectionnalités" };

export default function FinalSummaryPage({ characters, initialCharacters, playedSituations, choiceHistory, selectedCharacterId, selectedModeId, onRestart, onChooseAnotherCharacter, onBackHome, backHomeLabel }: Props) {
  const [selectedStep, setSelectedStep] = useState(0);
  const [openRecap, setOpenRecap] = useState<number>();
  const selectedCharacter = initialCharacters.find(({ id }) => id === selectedCharacterId);
  const name = selectedCharacter?.name ?? "Le personnage";
  const situationById = Object.fromEntries(playedSituations.map((situation) => [situation.id, situation]));
  const proposedPositions = Object.fromEntries(initialCharacters.map((character) => [character.id, playedSituations.reduce((position, situation) => {
    const decision = situation.movements[character.id];
    if (!decision) throw new Error(`Décision proposée absente : ${situation.id}/${character.id}`);
    return position + movementDecisionToStep(decision);
  }, 0)]));
  const concordanceCount = choiceHistory.filter(({ matchesProposedInterpretation }) => matchesProposedInterpretation).length;
  const calculatedFocalSummary = summarizeDiscoveryChoices(selectedModeId, choiceHistory);
  const focalSummary = calculatedFocalSummary.length > 0 ? calculatedFocalSummary : [{ originMode: selectedModeId, label: modeLabels[selectedModeId], concordances: concordanceCount, total: choiceHistory.length }];
  const selectedEntry = choiceHistory[selectedStep];
  const selectedSituation = selectedEntry ? situationById[selectedEntry.situationId] : undefined;
  const selectedFocal = selectedEntry && selectedSituation ? getRevealedSituationFamilyLabel(selectedModeId, selectedSituation.originMode) : undefined;
  const positionAfterSelectedStep = choiceHistory.slice(0, selectedStep + 1).reduce((position, entry) => position + movementDecisionToStep(entry.playerDecision), 0);

  useEffect(() => { requestAnimationFrame(() => { const title = document.querySelector<HTMLElement>(".game-summary h1"); title?.setAttribute("tabindex", "-1"); title?.focus({ preventScroll: true }); }); }, []);

  function recapPanel(entry: ChoiceHistoryEntryV2, index: number) {
    const situation = situationById[entry.situationId];
    if (!situation) throw new Error(`Situation jouée introuvable : ${entry.situationId}`);
    const feedback = situation.feedback;
    const focal = getRevealedSituationFamilyLabel(selectedModeId, situation.originMode);
    const open = openRecap === index;
    const buttonId = `summary-recap-button-${index + 1}`;
    const panelId = `summary-recap-panel-${index + 1}`;
    return <li key={entry.situationId} className={`summary-detail${open ? " summary-detail--open" : ""}`}><h3><button type="button" id={buttonId} aria-expanded={open} aria-controls={panelId} onClick={() => setOpenRecap((current) => current === index ? undefined : index)}><span>{index + 1}. {personalizePlayerText(situation.title, name)}</span><span className={entry.matchesProposedInterpretation ? "summary-status summary-status--concordant" : "summary-status summary-status--different"}>{entry.matchesProposedInterpretation ? "Lecture concordante" : "Lecture différente"}</span></button></h3><div role="region" id={panelId} aria-labelledby={buttonId} hidden={!open} className="summary-detail__panel">
      <section><h4>Situation</h4><p>{personalizePlayerText(situation.text, name)}</p></section>
      <InterpretationComparison id={`comparison-${situation.id}`} isCoherent={entry.matchesProposedInterpretation} playerMovement={movement(name, entry.playerDecision)} proposedMovement={movement(name, entry.proposedDecision)} />
      {focal && <p><strong>Focale :</strong> {focal}</p>}
      <section><h4>Pourquoi pour {name}&nbsp;?</h4><p>{personalizePlayerText(feedback.explanation, name)}</p></section>
      <section><h4>Mécanisme en jeu</h4><p>{personalizePlayerText(situation.mechanism, name)}</p></section>
      {situation.interpretation && <section><h4>Interprétation pédagogique</h4><p>{personalizePlayerText(situation.interpretation, name)}</p></section>}
      {situation.vigilance && <section><h4>Point de vigilance</h4><p>{personalizePlayerText(situation.vigilance, name)}</p></section>}
      {situation.intersectionalTest && <section><h4>Test intersectionnel</h4><p>{personalizePlayerText(situation.intersectionalTest, name)}</p></section>}
    </div></li>;
  }

  return <AppBackground as="main" className="summary-background game-summary" style={{ "--character-accent": selectedCharacter?.accentColor } as React.CSSProperties}><div className="game-summary__inner">
    <header className="game-summary__header"><h1>Bilan de votre parcours</h1><p>Ce bilan propose de revenir sur les situations rencontrées et de comparer votre lecture avec l’interprétation proposée.</p><p><strong>Mode :</strong> {modeLabels[selectedModeId]}</p>
      {selectedCharacter && <div className="app-surface selected-character-card game-summary__character"><CharacterPortrait characterId={selectedCharacter.id} characterName={selectedCharacter.name} image={selectedCharacter.image} accentColor={selectedCharacter.accentColor} size="summary" eager /><div><p><strong>{selectedCharacter.name}</strong></p><CharacterInformation character={selectedCharacter} compact /><p>{characters.find(({ id }) => id === selectedCharacterId)?.position ?? 0} pas effectués sur {playedSituations.length}</p></div></div>}
    </header>
    <section className="game-journey" aria-labelledby="game-journey-title"><h2 id="game-journey-title">Votre parcours dans les 10 situations</h2><div className="game-journey__steps">{choiceHistory.map((entry, index) => <button key={entry.situationId} type="button" className={entry.matchesProposedInterpretation ? "game-journey__step game-journey__step--concordant" : "game-journey__step game-journey__step--different"} aria-label={`Situation ${index + 1} — ${entry.matchesProposedInterpretation ? "lecture concordante" : "lecture différente"}`} aria-pressed={selectedStep === index} onClick={() => setSelectedStep(index)}>{index + 1}</button>)}</div></section>
    <div className="game-summary__overview">
      <div className="game-summary__walk"><PrivilegeMargin characters={characters} selectedCharacterId={selectedCharacterId} totalExperiences={playedSituations.length} proposedPositions={proposedPositions} className="mb-0" prominent /></div>
      <aside className="game-summary__pedagogy" aria-labelledby="game-summary-pedagogy-title"><h2 id="game-summary-pedagogy-title">Votre bilan</h2>
        <section><h3>Comparaison avec l’interprétation proposée</h3><p><strong>{concordanceCount} lectures concordantes</strong> sur {playedSituations.length}.</p><p>Cet indicateur n’est pas une note. Il montre simplement combien de fois votre lecture rejoint l’interprétation proposée dans l’activité.</p></section>
        <section><h3>Lecture par focale</h3><ul>{focalSummary.map((focal) => <li key={focal.originMode}><strong>{focal.label} :</strong> {focal.concordances} concordances sur {focal.total}</li>)}</ul><p>Cette répartition montre les angles d’analyse rencontrés parmi les dix situations de votre partie.</p></section>
        {selectedEntry && selectedSituation && <section className="game-step-detail" aria-live="polite"><h3>Situation {selectedStep + 1} — {personalizePlayerText(selectedSituation.title, name)}</h3><p><strong>Votre lecture :</strong> {movement(name, selectedEntry.playerDecision)}.</p><p><strong>Interprétation proposée :</strong> {movement(name, selectedEntry.proposedDecision)}.</p>{selectedFocal && <p><strong>Focale :</strong> {selectedFocal}.</p>}<p><strong>Position après cette situation :</strong> {positionAfterSelectedStep} pas.</p></section>}
      </aside>
    </div>
    <section className="game-summary__recap" aria-labelledby="game-summary-recap-title"><h2 id="game-summary-recap-title">Récapitulatif de vos réponses</h2><ol>{choiceHistory.map(recapPanel)}</ol></section>
    <div className="game-summary__actions"><Button onClick={onRestart}>Rejouer</Button><Button variant="secondary" onClick={onChooseAnotherCharacter}>Changer de personnage</Button><Button variant="ghost" onClick={onBackHome}>{backHomeLabel}</Button></div>
  </div></AppBackground>;
}
