import generalGalleryJson from "../generated-v2/galleries/general.json";
import intersectionalGalleryJson from "../generated-v2/galleries/intersectional.json";
import discoveryJson from "../generated-v2/modes/discovery.json";
import intersectionalitiesJson from "../generated-v2/modes/intersectionalities.json";
import invisibleEffectsJson from "../generated-v2/modes/invisible-effects.json";
import ordinaryNormsJson from "../generated-v2/modes/ordinary-norms.json";
import visibleObstaclesJson from "../generated-v2/modes/visible-obstacles.json";
import {
  selectDiscoverySituations,
  selectStandaloneSituationIds,
} from "../../engine/selectRuntimeV2Situations";
import { selectVisibleObstacleSituationIds } from "../../engine/selectVisibleObstaclesSituations";
import type {
  CharacterIdV2,
  EditorialCharacterIdV2,
  EditorialGalleryIdV2,
  EditorialModeIdV2,
  EditorialSituationIdV2,
  IntersectionalCharacterIdV2,
  IntersectionalCharacterV2,
} from "../../types/editorialV2";
import type {
  CreateGameSetOptionsV2,
  IntersectionalRuntimeCharacterV2,
  NormalizedRuntimeBankV2,
  NormalizedRuntimeSituationV2,
  RuntimeCharacterV2,
  RuntimeGameSetV2,
  RuntimeModeId,
  RuntimeRandom,
  RuntimeSituationV2,
  StandaloneRuntimeModeId,
} from "../../types/runtimeV2";
import { playableCharactersV2 } from "./runtimeV2";
import { getCharacterPortraitV2 } from "./characterPortraitsV2";

function runtimeError(message: string): never {
  throw new Error(`Runtime V2 — ${message}`);
}

const normalizedBanks = {
  "visible-obstacles": { ...visibleObstaclesJson, idPrefix: "V" },
  "ordinary-norms": { ...ordinaryNormsJson, idPrefix: "N" },
  "invisible-effects": { ...invisibleEffectsJson, idPrefix: "I" },
  intersectionalities: { ...intersectionalitiesJson, idPrefix: "X" },
} as unknown as Readonly<Record<Exclude<RuntimeModeId, "discovery">, NormalizedRuntimeBankV2>>;

type DiscoveryRules = {
  readonly galleryId: "general";
  readonly totalSituationCount: 10;
  readonly quotas: Readonly<Record<StandaloneRuntimeModeId, number>>;
  readonly sourceModes: readonly StandaloneRuntimeModeId[];
  readonly protectiveCount: number;
  readonly intersectionalIncluded: false;
  readonly characterRequirements: Readonly<Record<string, NormalizedRuntimeBankV2["rules"]["characterRequirements"][string]>>;
  readonly obstacleRangePerCharacter: Readonly<{ minimum: number; maximum: number }>;
};

const discoveryRules = discoveryJson.rules as unknown as DiscoveryRules;
const generalCharacterIds = new Set((generalGalleryJson.characters as readonly { id: string }[]).map(({ id }) => id));
const intersectionalCharacterIds = new Set((intersectionalGalleryJson.characters as readonly { id: string }[]).map(({ id }) => id));

export const intersectionalCharactersV2: readonly IntersectionalRuntimeCharacterV2[] = Object.freeze(
  (intersectionalGalleryJson.characters as readonly IntersectionalCharacterV2[]).map((character) => Object.freeze({
    ...character,
    image: getCharacterPortraitV2(character.id),
  })),
);

export const intersectionalCharactersV2ById: Readonly<Record<IntersectionalCharacterIdV2, IntersectionalRuntimeCharacterV2>> = Object.freeze(
  Object.fromEntries(intersectionalCharactersV2.map((character) => [character.id, character])) as Record<IntersectionalCharacterIdV2, IntersectionalRuntimeCharacterV2>,
);

export const runtimeCharactersByGalleryV2: Readonly<Record<EditorialGalleryIdV2, readonly RuntimeCharacterV2[]>> = Object.freeze({
  general: playableCharactersV2,
  intersectional: intersectionalCharactersV2,
});

function galleryForMode(modeId: RuntimeModeId): EditorialGalleryIdV2 {
  return modeId === "intersectionalities" ? "intersectional" : "general";
}

function assertMode(modeId: string): asserts modeId is RuntimeModeId {
  if (!["visible-obstacles", "ordinary-norms", "invisible-effects", "intersectionalities", "discovery"].includes(modeId)) {
    runtimeError(`mode inconnu « ${modeId} »`);
  }
}

function assertCharacter(modeId: RuntimeModeId, characterId: string): asserts characterId is EditorialCharacterIdV2 {
  const galleryId = galleryForMode(modeId);
  const expectedIds = galleryId === "general" ? generalCharacterIds : intersectionalCharacterIds;
  if (!expectedIds.has(characterId)) {
    runtimeError(`mode ${modeId} — personnage ${characterId} absent de la galerie ${galleryId}`);
  }
}

function resolveSituation(
  situation: NormalizedRuntimeSituationV2,
  gameModeId: RuntimeModeId,
  characterId: EditorialCharacterIdV2,
): RuntimeSituationV2 {
  const proposedDecision = situation.effectsByCharacter[characterId];
  const feedback = situation.feedbacksByCharacter[characterId];
  if (!proposedDecision) runtimeError(`mode ${gameModeId} — situation ${situation.id} — décision absente pour ${characterId}`);
  if (!feedback) runtimeError(`mode ${gameModeId} — situation ${situation.id} — feedback absent pour ${characterId}`);
  if (feedback.decision !== proposedDecision) runtimeError(`mode ${gameModeId} — situation ${situation.id} — décision et feedback divergents pour ${characterId}`);
  return Object.freeze({
    id: situation.id,
    modeId: gameModeId,
    originMode: situation.modeId,
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

function createResolvedGameSet(
  modeId: RuntimeModeId,
  characterId: EditorialCharacterIdV2,
  selected: readonly NormalizedRuntimeSituationV2[],
): RuntimeGameSetV2 {
  if (selected.length !== 10 || new Set(selected.map(({ id }) => id)).size !== 10) {
    runtimeError(`mode ${modeId} — personnage ${characterId} — exactement dix situations uniques attendues`);
  }
  const situations = Object.freeze(selected.map((situation) => resolveSituation(situation, modeId, characterId)));
  return Object.freeze({
    modeId,
    galleryId: galleryForMode(modeId),
    characterId,
    situationIds: Object.freeze(situations.map(({ id }) => id)),
    situations,
  });
}

function situationMap(bank: NormalizedRuntimeBankV2): ReadonlyMap<EditorialSituationIdV2, NormalizedRuntimeSituationV2> {
  return new Map(bank.situations.map((situation) => [situation.id, situation]));
}

function createStandaloneGameSet(
  modeId: Exclude<RuntimeModeId, "visible-obstacles" | "discovery">,
  characterId: EditorialCharacterIdV2,
  random: RuntimeRandom,
): RuntimeGameSetV2 {
  const bank = normalizedBanks[modeId];
  const byId = situationMap(bank);
  const ids = selectStandaloneSituationIds(bank, characterId, random);
  const situations = ids.map((id) => byId.get(id) ?? runtimeError(`mode ${modeId} — situation générée inconnue ${id}`));
  return createResolvedGameSet(modeId, characterId, situations);
}

export function createCommonVisibleObstaclesGameSet(characterId: CharacterIdV2, random: RuntimeRandom = Math.random): RuntimeGameSetV2 {
  assertCharacter("visible-obstacles", characterId);
  const bank = normalizedBanks["visible-obstacles"];
  const byId = situationMap(bank);
  const situations = selectVisibleObstacleSituationIds(random).map((id) => byId.get(id) ?? runtimeError(`mode visible-obstacles — situation générée inconnue ${id}`));
  return createResolvedGameSet("visible-obstacles", characterId, situations);
}

export function createOrdinaryNormsGameSet(characterId: CharacterIdV2, random: RuntimeRandom = Math.random): RuntimeGameSetV2 {
  assertCharacter("ordinary-norms", characterId);
  return createStandaloneGameSet("ordinary-norms", characterId, random);
}

export function createInvisibleEffectsGameSet(characterId: CharacterIdV2, random: RuntimeRandom = Math.random): RuntimeGameSetV2 {
  assertCharacter("invisible-effects", characterId);
  return createStandaloneGameSet("invisible-effects", characterId, random);
}

export function createIntersectionalitiesGameSet(characterId: IntersectionalCharacterIdV2, random: RuntimeRandom = Math.random): RuntimeGameSetV2 {
  assertCharacter("intersectionalities", characterId);
  return createStandaloneGameSet("intersectionalities", characterId, random);
}

export function createDiscoveryGameSet(characterId: CharacterIdV2, random: RuntimeRandom = Math.random): RuntimeGameSetV2 {
  assertCharacter("discovery", characterId);
  const sourceBanks = {
    "visible-obstacles": normalizedBanks["visible-obstacles"],
    "ordinary-norms": normalizedBanks["ordinary-norms"],
    "invisible-effects": normalizedBanks["invisible-effects"],
  } satisfies Readonly<Record<StandaloneRuntimeModeId, NormalizedRuntimeBankV2>>;
  const selected = selectDiscoverySituations(
    sourceBanks,
    characterId,
    random,
    discoveryRules.quotas,
    discoveryRules.characterRequirements[characterId],
    discoveryRules.obstacleRangePerCharacter,
  );
  return createResolvedGameSet("discovery", characterId, selected);
}

export function createGameSet(options: CreateGameSetOptionsV2): RuntimeGameSetV2 {
  const { modeId, characterId, random = Math.random } = options;
  assertMode(modeId);
  assertCharacter(modeId, characterId);
  if (modeId === "visible-obstacles") return createCommonVisibleObstaclesGameSet(characterId as CharacterIdV2, random);
  if (modeId === "ordinary-norms") return createOrdinaryNormsGameSet(characterId as CharacterIdV2, random);
  if (modeId === "invisible-effects") return createInvisibleEffectsGameSet(characterId as CharacterIdV2, random);
  if (modeId === "intersectionalities") return createIntersectionalitiesGameSet(characterId as IntersectionalCharacterIdV2, random);
  return createDiscoveryGameSet(characterId as CharacterIdV2, random);
}

export function createSeededRuntimeRandom(seed: number): RuntimeRandom {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) runtimeError(`graine entière non signée attendue, valeur reçue : ${String(seed)}`);
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function getRuntimeCharactersForMode(modeId: EditorialModeIdV2): readonly RuntimeCharacterV2[] {
  assertMode(modeId);
  return runtimeCharactersByGalleryV2[galleryForMode(modeId)];
}

export const normalizedRuntimeBanksV2 = normalizedBanks;
