import intersectionalGalleryJson from "../generated-v2/galleries/intersectional.json";
import invisibleEffectsJson from "../generated-v2/modes/invisible-effects.json";
import intersectionalitiesJson from "../generated-v2/modes/intersectionalities.json";
import ordinaryNormsJson from "../generated-v2/modes/ordinary-norms.json";
import { selectStandaloneSituationIds } from "../../engine/selectRuntimeV2Situations";
import type {
  CharacterIdV2,
  EditorialCharacterIdV2,
  EditorialGalleryIdV2,
  EditorialSituationIdV2,
  IntersectionalCharacterIdV2,
  IntersectionalCharacterV2,
} from "../../types/editorialV2";
import type {
  ActivePlayableCharacterV2,
  NormalizedRuntimeBankV2,
  NormalizedRuntimeSituationV2,
  PlayerSituationContentV2,
  PlayableIntersectionalCharacterV2,
  RuntimeGameSetV2,
  RuntimeRandom,
  RuntimeSituationV2,
} from "../../types/runtimeV2";
import {
  createVisibleObstaclesGameSet,
  getPlayableVisibleObstacleFeedback,
  playableCharactersV2,
} from "./runtimeV2";
import { createDiscoveryGameSet as createCommonDiscoveryGameSet } from "./allModesRuntimeV2";
import type { ChoiceHistoryEntryV2 } from "../../types/choiceHistory";
import { getCharacterPortraitV2 } from "./characterPortraitsV2";

export type ActiveGameModeIdV2 =
  | "discovery"
  | "visible-obstacles"
  | "ordinary-norms"
  | "invisible-effects"
  | "intersectionalities";

const ACTIVE_GAME_MODE_IDS: readonly ActiveGameModeIdV2[] = [
  "discovery",
  "visible-obstacles",
  "ordinary-norms",
  "invisible-effects",
  "intersectionalities",
];

export type DiscoveryOriginModeV2 =
  | "visible-obstacles"
  | "ordinary-norms"
  | "invisible-effects";

const DISCOVERY_FAMILY_LABELS: Readonly<Record<DiscoveryOriginModeV2, string>> = {
  "visible-obstacles": "Obstacles visibles",
  "ordinary-norms": "Normes ordinaires",
  "invisible-effects": "Effets invisibles",
};

export interface DiscoveryFamilySummaryV2 {
  readonly originMode: DiscoveryOriginModeV2;
  readonly label: string;
  readonly concordances: number;
  readonly total: number;
}

const GENERAL_PLAYER_ORDER: readonly CharacterIdV2[] = [
  "P04", "P05", "P09", "P02", "P06", "P07", "P08", "P01", "P03",
];
const INTERSECTIONAL_PLAYER_ORDER: readonly IntersectionalCharacterIdV2[] = [
  "XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08",
];
const INTERSECTIONAL_ACCENTS: Readonly<Record<IntersectionalCharacterIdV2, string>> = {
  XP01: "#2563A9",
  XP02: "#A83E74",
  XP03: "#A65D20",
  XP04: "#6D4CC3",
  XP05: "#377A52",
  XP06: "#B85C7A",
  XP07: "#4F46A5",
  XP08: "#0F766E",
};

const generalCharactersById = new Map(playableCharactersV2.map((character) => [character.id, character]));
const generalCharactersForPlayers: readonly ActivePlayableCharacterV2[] = Object.freeze(
  GENERAL_PLAYER_ORDER.map((id) => generalCharactersById.get(id) ?? activeRuntimeError(`galerie générale : personnage inconnu ${id}`)),
);
const intersectionalSourceCharacters = intersectionalGalleryJson.characters as readonly IntersectionalCharacterV2[];
const intersectionalCharactersById = new Map(intersectionalSourceCharacters.map((character) => [character.id, character]));
const intersectionalCharactersForPlayers: readonly PlayableIntersectionalCharacterV2[] = Object.freeze(
  INTERSECTIONAL_PLAYER_ORDER.map((id) => {
    const character = intersectionalCharactersById.get(id);
    if (!character) activeRuntimeError(`galerie intersectionnelle : personnage inconnu ${id}`);
    return Object.freeze({
      ...character,
      accentColor: INTERSECTIONAL_ACCENTS[id],
      image: getCharacterPortraitV2(id),
    });
  }),
);

const ordinaryNormsBank = {
  ...ordinaryNormsJson,
  idPrefix: "N",
} as unknown as NormalizedRuntimeBankV2;

const invisibleEffectsBank = {
  ...invisibleEffectsJson,
  idPrefix: "I",
} as unknown as NormalizedRuntimeBankV2;

const intersectionalitiesBank = {
  ...intersectionalitiesJson,
  idPrefix: "X",
} as unknown as NormalizedRuntimeBankV2;

function activeRuntimeError(message: string): never {
  throw new Error(`Runtime des modes actifs V2 — ${message}`);
}

function isGeneralCharacterId(characterId: EditorialCharacterIdV2): characterId is CharacterIdV2 {
  return characterId.startsWith("P");
}

function isIntersectionalCharacterId(characterId: EditorialCharacterIdV2): characterId is IntersectionalCharacterIdV2 {
  return characterId.startsWith("XP");
}

function galleryForMode(modeId: ActiveGameModeIdV2): EditorialGalleryIdV2 {
  return modeId === "intersectionalities" ? "intersectional" : "general";
}

function isDiscoveryOriginMode(
  modeId: RuntimeSituationV2["originMode"],
): modeId is DiscoveryOriginModeV2 {
  return modeId !== "intersectionalities";
}

export function getDiscoveryFamilyLabel(originMode: DiscoveryOriginModeV2): string {
  return DISCOVERY_FAMILY_LABELS[originMode];
}

export function getRevealedSituationFamilyLabel(
  modeId: ActiveGameModeIdV2,
  originMode: RuntimeSituationV2["originMode"],
): string | undefined {
  if (modeId !== "discovery" || !isDiscoveryOriginMode(originMode)) return undefined;
  return getDiscoveryFamilyLabel(originMode);
}

export function preparePlayerSituation(
  situation: RuntimeSituationV2,
): PlayerSituationContentV2 {
  return Object.freeze({
    title: situation.title,
    text: situation.text,
    question: situation.question,
    image: situation.image,
  });
}

export function summarizeDiscoveryChoices(
  modeId: ActiveGameModeIdV2,
  entries: readonly ChoiceHistoryEntryV2[],
): readonly DiscoveryFamilySummaryV2[] {
  if (modeId !== "discovery") return [];
  return (Object.keys(DISCOVERY_FAMILY_LABELS) as DiscoveryOriginModeV2[]).map((originMode) => {
    const familyEntries = entries.filter((entry) => entry.originMode === originMode);
    return Object.freeze({
      originMode,
      label: getDiscoveryFamilyLabel(originMode),
      concordances: familyEntries.filter(({ matchesProposedInterpretation }) => matchesProposedInterpretation).length,
      total: familyEntries.length,
    });
  });
}

export function isActiveGameModeId(modeId: string): modeId is ActiveGameModeIdV2 {
  return ACTIVE_GAME_MODE_IDS.some((activeModeId) => activeModeId === modeId);
}

function assertCharacterForMode(modeId: ActiveGameModeIdV2, characterId: EditorialCharacterIdV2): void {
  const valid = modeId === "intersectionalities"
    ? isIntersectionalCharacterId(characterId) && intersectionalCharactersById.has(characterId)
    : isGeneralCharacterId(characterId) && generalCharactersById.has(characterId);
  if (!valid) activeRuntimeError(`${modeId}/${characterId} : personnage absent de la galerie ${galleryForMode(modeId)}`);
}

function createGameSet(
  modeId: ActiveGameModeIdV2,
  characterId: EditorialCharacterIdV2,
  situations: readonly RuntimeSituationV2[],
): RuntimeGameSetV2 {
  if (situations.length !== 10 || new Set(situations.map(({ id }) => id)).size !== 10) {
    activeRuntimeError(`${modeId}/${characterId} : dix situations uniques attendues`);
  }
  return Object.freeze({
    modeId,
    galleryId: galleryForMode(modeId),
    characterId,
    situationIds: Object.freeze(situations.map(({ id }) => id)),
    situations: Object.freeze(situations),
  });
}

function resolveNormalizedSituation(
  modeId: Exclude<ActiveGameModeIdV2, "visible-obstacles" | "discovery">,
  situation: NormalizedRuntimeSituationV2,
  characterId: EditorialCharacterIdV2,
): RuntimeSituationV2 {
  const proposedDecision = situation.effectsByCharacter[characterId];
  const feedback = situation.feedbacksByCharacter[characterId];
  if (!proposedDecision || !feedback || feedback.decision !== proposedDecision) {
    activeRuntimeError(`${modeId}/${situation.id}/${characterId} : décision ou feedback incohérent`);
  }
  return Object.freeze({
    id: situation.id,
    modeId,
    originMode: modeId,
    title: situation.title,
    text: situation.playerText,
    playerText: situation.playerText,
    question: situation.question,
    sceneType: situation.sceneType,
    ...(situation.subfamily ? { subfamily: situation.subfamily } : {}),
    mechanism: situation.mechanism,
    ...(situation.interpretation ? { interpretation: situation.interpretation } : {}),
    ...(situation.vigilance ? { vigilance: situation.vigilance } : {}),
    ...(situation.intersectionalTest ? { intersectionalTest: situation.intersectionalTest } : {}),
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
    return resolveNormalizedSituation("ordinary-norms", situation, characterId);
  }));
}

export function createActiveInvisibleEffectsGameSet(
  characterId: CharacterIdV2,
  random: RuntimeRandom = Math.random,
): RuntimeGameSetV2 {
  const byId = new Map<EditorialSituationIdV2, NormalizedRuntimeSituationV2>(
    invisibleEffectsBank.situations.map((situation) => [situation.id, situation]),
  );
  const ids = selectStandaloneSituationIds(invisibleEffectsBank, characterId, random);
  return createGameSet("invisible-effects", characterId, ids.map((id) => {
    const situation = byId.get(id);
    if (!situation) activeRuntimeError(`invisible-effects : situation inconnue ${id}`);
    return resolveNormalizedSituation("invisible-effects", situation, characterId);
  }));
}

export function createActiveIntersectionalitiesGameSet(
  characterId: IntersectionalCharacterIdV2,
  random: RuntimeRandom = Math.random,
): RuntimeGameSetV2 {
  assertCharacterForMode("intersectionalities", characterId);
  const byId = new Map<EditorialSituationIdV2, NormalizedRuntimeSituationV2>(
    intersectionalitiesBank.situations.map((situation) => [situation.id, situation]),
  );
  const ids = selectStandaloneSituationIds(intersectionalitiesBank, characterId, random);
  return createGameSet("intersectionalities", characterId, ids.map((id) => {
    const situation = byId.get(id);
    if (!situation) activeRuntimeError(`intersectionalities : situation inconnue ${id}`);
    return resolveNormalizedSituation("intersectionalities", situation, characterId);
  }));
}

export function createActiveDiscoveryGameSet(
  characterId: CharacterIdV2,
  random: RuntimeRandom = Math.random,
): RuntimeGameSetV2 {
  assertCharacterForMode("discovery", characterId);
  const gameSet = createCommonDiscoveryGameSet(characterId, random);
  if (gameSet.modeId !== "discovery" || gameSet.galleryId !== "general") {
    return activeRuntimeError(`discovery/${characterId} : lot ou galerie incohérent`);
  }
  return gameSet;
}

export function getActiveCharactersForMode(
  modeId: ActiveGameModeIdV2,
): readonly ActivePlayableCharacterV2[] {
  return modeId === "intersectionalities"
    ? intersectionalCharactersForPlayers
    : generalCharactersForPlayers;
}

export function getActiveCharacter(
  modeId: ActiveGameModeIdV2,
  characterId: EditorialCharacterIdV2,
): ActivePlayableCharacterV2 {
  assertCharacterForMode(modeId, characterId);
  const character = getActiveCharactersForMode(modeId).find(({ id }) => id === characterId);
  return character ?? activeRuntimeError(`${modeId}/${characterId} : personnage jouable introuvable`);
}

export function createActiveGameSet(
  modeId: ActiveGameModeIdV2,
  characterId: EditorialCharacterIdV2,
  random: RuntimeRandom = Math.random,
): RuntimeGameSetV2 {
  assertCharacterForMode(modeId, characterId);
  if (modeId === "intersectionalities") {
    if (!isIntersectionalCharacterId(characterId)) return activeRuntimeError(`${modeId}/${characterId} : personnage intersectionnel attendu`);
    return createActiveIntersectionalitiesGameSet(characterId, random);
  }
  if (!isGeneralCharacterId(characterId)) return activeRuntimeError(`${modeId}/${characterId} : personnage général attendu`);
  if (modeId === "discovery") return createActiveDiscoveryGameSet(characterId, random);
  if (modeId === "visible-obstacles") return createActiveVisibleObstaclesGameSet(characterId, random);
  if (modeId === "ordinary-norms") return createActiveOrdinaryNormsGameSet(characterId, random);
  if (modeId === "invisible-effects") return createActiveInvisibleEffectsGameSet(characterId, random);
  return activeRuntimeError(`mode non actif ${String(modeId)}`);
}
