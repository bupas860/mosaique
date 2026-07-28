import { selectVisibleObstacleSituationIds } from "../../engine/selectVisibleObstaclesSituations";
import type { CharacterIdV2, MovementDecision, VisibleObstacleSituationId } from "../../types/editorialV2";
import type {
  PlayableCharacterV2,
  PlayableVisibleObstacleFeedback,
  PlayableVisibleObstacleSituation,
  VisibleObstaclesGameSet,
  VisibleObstaclesRuntimeBank,
} from "../../types/runtimeV2";
import {
  createVisibleObstacleFeedbackKey,
  visibleObstacleFeedbacks,
  visibleObstacleFeedbacksByKey,
  visibleObstaclesBank,
} from "./generatedV2Data";
import { characterPresentationConfigV2 } from "./presentationConfig";

function runtimeError(message: string): never {
  throw new Error(`Banque runtime V2 incohérente — ${message}`);
}

const characterIds = visibleObstaclesBank.characters.map(({ id }) => id);
const presentationIds = Object.keys(characterPresentationConfigV2) as CharacterIdV2[];
if (presentationIds.length !== 9 || new Set(presentationIds).size !== 9) runtimeError("exactement neuf configurations graphiques uniques sont attendues");
if (characterIds.some((id) => !presentationIds.includes(id)) || presentationIds.some((id) => !characterIds.includes(id))) runtimeError("les configurations graphiques doivent correspondre exactement aux personnages P01 à P09");
const colors = presentationIds.map((id) => characterPresentationConfigV2[id].accentColor);
if (colors.some((color) => !/^#[0-9A-F]{6}$/i.test(color)) || new Set(colors.map((color) => color.toLowerCase())).size !== 9) runtimeError("neuf couleurs hexadécimales distinctes sont attendues");
export const playableCharactersV2: readonly PlayableCharacterV2[] = Object.freeze(visibleObstaclesBank.characters.map((character) => Object.freeze({
  ...character,
  accentColor: characterPresentationConfigV2[character.id].accentColor,
  image: characterPresentationConfigV2[character.id].image,
})));

export const playableCharactersV2ById: Readonly<Record<CharacterIdV2, PlayableCharacterV2>> = Object.freeze(Object.fromEntries(playableCharactersV2.map((character) => [character.id, character])) as Record<CharacterIdV2, PlayableCharacterV2>);
if (playableCharactersV2ById.P08.name !== "Lou") runtimeError("P08 doit correspondre à Lou");

export const playableVisibleObstacleSituations: readonly PlayableVisibleObstacleSituation[] = Object.freeze(visibleObstaclesBank.situations.map((situation) => {
  const movements = Object.freeze(Object.fromEntries(characterIds.map((characterId) => {
    const decision = visibleObstaclesBank.matrix[situation.id]?.[characterId];
    if (decision !== "advance" && decision !== "stay") runtimeError(`mouvement absent ou invalide : ${situation.id}/${characterId}`);
    return [characterId, decision];
  })) as Record<CharacterIdV2, MovementDecision>);
  if (Object.keys(movements).length !== 9) runtimeError(`${situation.id} doit contenir neuf mouvements`);
  return Object.freeze({ ...situation, image: null, movements });
}));
if (playableVisibleObstacleSituations.length !== 16) runtimeError("exactement seize situations jouables sont attendues");
if (playableVisibleObstacleSituations.some(({ image }) => image !== null)) runtimeError("toutes les images de situations doivent valoir null");

export const playableVisibleObstacleSituationsById: Readonly<Record<VisibleObstacleSituationId, PlayableVisibleObstacleSituation>> = Object.freeze(Object.fromEntries(playableVisibleObstacleSituations.map((situation) => [situation.id, situation])) as Record<VisibleObstacleSituationId, PlayableVisibleObstacleSituation>);

export const playableVisibleObstacleFeedbacks: readonly PlayableVisibleObstacleFeedback[] = visibleObstacleFeedbacks;
export const playableVisibleObstacleFeedbacksByKey: Readonly<Record<`${VisibleObstacleSituationId}:${CharacterIdV2}`, PlayableVisibleObstacleFeedback>> = visibleObstacleFeedbacksByKey;

for (const situation of playableVisibleObstacleSituations) {
  for (const character of playableCharactersV2) {
    const key = createVisibleObstacleFeedbackKey(situation.id, character.id);
    const feedback = playableVisibleObstacleFeedbacksByKey[key];
    if (!feedback) runtimeError(`feedback absent : ${situation.id}/${character.id}`);
    if (feedback.decision !== situation.movements[character.id]) runtimeError(`feedback et mouvement divergents : ${situation.id}/${character.id}`);
  }
}
if (playableVisibleObstacleFeedbacks.length !== 144 || Object.keys(playableVisibleObstacleFeedbacksByKey).length !== 144) runtimeError("exactement 144 feedbacks accessibles sont attendus");

export function getPlayableCharacterV2(characterId: CharacterIdV2): PlayableCharacterV2 {
  return playableCharactersV2ById[characterId] ?? runtimeError(`personnage introuvable : ${characterId}`);
}

export function getPlayableVisibleObstacleSituation(situationId: VisibleObstacleSituationId): PlayableVisibleObstacleSituation {
  return playableVisibleObstacleSituationsById[situationId] ?? runtimeError(`situation introuvable : ${situationId}`);
}

export function getVisibleObstacleMovement(situationId: VisibleObstacleSituationId, characterId: CharacterIdV2): MovementDecision {
  return getPlayableVisibleObstacleSituation(situationId).movements[characterId] ?? runtimeError(`mouvement introuvable : ${situationId}/${characterId}`);
}

export function getPlayableVisibleObstacleFeedback(situationId: VisibleObstacleSituationId, characterId: CharacterIdV2): PlayableVisibleObstacleFeedback {
  return playableVisibleObstacleFeedbacksByKey[createVisibleObstacleFeedbackKey(situationId, characterId)] ?? runtimeError(`feedback introuvable : ${situationId}/${characterId}`);
}

export function movementDecisionToStep(decision: MovementDecision): 0 | 1 {
  if (decision === "advance") return 1;
  if (decision === "stay") return 0;
  return runtimeError(`décision de mouvement inconnue : ${String(decision)}`);
}

export function createVisibleObstaclesGameSet(random: () => number = Math.random): VisibleObstaclesGameSet {
  const situationIds = Object.freeze([...selectVisibleObstacleSituationIds(random)]);
  if (situationIds.length !== 10 || new Set(situationIds).size !== 10) runtimeError("un lot de jeu doit contenir exactement dix situations uniques");
  const situations = Object.freeze(situationIds.map(getPlayableVisibleObstacleSituation));
  if (situations.some((situation, index) => situation.id !== situationIds[index])) runtimeError("l’ordre des situations résolues diffère des identifiants tirés");
  return Object.freeze({ modeId: "visible-obstacles", situationIds, situations });
}

export const visibleObstaclesRuntimeBank: VisibleObstaclesRuntimeBank = Object.freeze({
  modeId: "visible-obstacles",
  characters: playableCharactersV2,
  charactersById: playableCharactersV2ById,
  situations: playableVisibleObstacleSituations,
  situationsById: playableVisibleObstacleSituationsById,
  feedbacks: playableVisibleObstacleFeedbacks,
  feedbacksByKey: playableVisibleObstacleFeedbacksByKey,
  rules: visibleObstaclesBank.rules,
});
