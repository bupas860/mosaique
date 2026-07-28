import ordinaryNormsJson from "../generated-v2/modes/ordinary-norms.json";
import { selectStandaloneSituationIds } from "../../engine/selectRuntimeV2Situations";
import type {
  CharacterIdV2,
  EditorialSituationIdV2,
} from "../../types/editorialV2";
import type {
  NormalizedRuntimeBankV2,
  NormalizedRuntimeSituationV2,
  RuntimeGameSetV2,
  RuntimeRandom,
  RuntimeSituationV2,
} from "../../types/runtimeV2";
import {
  createVisibleObstaclesGameSet,
  getPlayableVisibleObstacleFeedback,
} from "./runtimeV2";

export type ActiveGameModeIdV2 = "visible-obstacles" | "ordinary-norms";

const ordinaryNormsBank = {
  ...ordinaryNormsJson,
  idPrefix: "N",
} as unknown as NormalizedRuntimeBankV2;

function activeRuntimeError(message: string): never {
  throw new Error(`Runtime des modes actifs V2 — ${message}`);
}

function createGameSet(
  modeId: ActiveGameModeIdV2,
  characterId: CharacterIdV2,
  situations: readonly RuntimeSituationV2[],
): RuntimeGameSetV2 {
  if (situations.length !== 10 || new Set(situations.map(({ id }) => id)).size !== 10) {
    activeRuntimeError(`${modeId}/${characterId} : dix situations uniques attendues`);
  }
  return Object.freeze({
    modeId,
    galleryId: "general",
    characterId,
    situationIds: Object.freeze(situations.map(({ id }) => id)),
    situations: Object.freeze(situations),
  });
}

function resolveOrdinaryNorm(
  situation: NormalizedRuntimeSituationV2,
  characterId: CharacterIdV2,
): RuntimeSituationV2 {
  const proposedDecision = situation.effectsByCharacter[characterId];
  const feedback = situation.feedbacksByCharacter[characterId];
  if (!proposedDecision || !feedback || feedback.decision !== proposedDecision) {
    activeRuntimeError(`ordinary-norms/${situation.id}/${characterId} : décision ou feedback incohérent`);
  }
  return Object.freeze({
    id: situation.id,
    modeId: "ordinary-norms",
    originMode: "ordinary-norms",
    title: situation.title,
    text: situation.playerText,
    playerText: situation.playerText,
    question: situation.question,
    sceneType: situation.sceneType,
    ...(situation.subfamily ? { subfamily: situation.subfamily } : {}),
    mechanism: situation.mechanism,
    ...(situation.interpretation ? { interpretation: situation.interpretation } : {}),
    ...(situation.vigilance ? { vigilance: situation.vigilance } : {}),
    mandatory: situation.mandatory,
    protective: situation.protective,
    proposedDecision,
    feedback,
    movements: situation.effectsByCharacter,
    image: null,
  });
}

export function createActiveVisibleObstaclesGameSet(
  characterId: CharacterIdV2,
  random: RuntimeRandom = Math.random,
): RuntimeGameSetV2 {
  const legacy = createVisibleObstaclesGameSet(random);
  return createGameSet("visible-obstacles", characterId, legacy.situations.map((situation) => {
    const proposedDecision = situation.movements[characterId];
    const feedback = getPlayableVisibleObstacleFeedback(situation.id, characterId);
    return Object.freeze({
      id: situation.id,
      modeId: "visible-obstacles",
      originMode: "visible-obstacles",
      title: situation.title,
      text: situation.text,
      playerText: situation.text,
      question: situation.question,
      sceneType: situation.sceneType,
      subfamily: situation.subfamily,
      mechanism: situation.mechanism,
      mandatory: situation.mandatory,
      protective: situation.sceneType === "protective",
      proposedDecision,
      feedback,
      movements: situation.movements,
      image: null,
    });
  }));
}

export function createActiveOrdinaryNormsGameSet(
  characterId: CharacterIdV2,
  random: RuntimeRandom = Math.random,
): RuntimeGameSetV2 {
  const byId = new Map<EditorialSituationIdV2, NormalizedRuntimeSituationV2>(
    ordinaryNormsBank.situations.map((situation) => [situation.id, situation]),
  );
  const ids = selectStandaloneSituationIds(ordinaryNormsBank, characterId, random);
  return createGameSet("ordinary-norms", characterId, ids.map((id) => {
    const situation = byId.get(id);
    if (!situation) activeRuntimeError(`ordinary-norms : situation inconnue ${id}`);
    return resolveOrdinaryNorm(situation, characterId);
  }));
}

export function createActiveGameSet(
  modeId: ActiveGameModeIdV2,
  characterId: CharacterIdV2,
  random: RuntimeRandom = Math.random,
): RuntimeGameSetV2 {
  if (modeId === "visible-obstacles") return createActiveVisibleObstaclesGameSet(characterId, random);
  if (modeId === "ordinary-norms") return createActiveOrdinaryNormsGameSet(characterId, random);
  return activeRuntimeError(`mode non actif ${String(modeId)}`);
}
