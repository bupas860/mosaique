import charactersJson from "../generated-v2/characters.json";
import feedbacksJson from "../generated-v2/modes/visible-obstacles.feedbacks.json";
import manifestJson from "../generated-v2/modes/visible-obstacles.manifest.json";
import matrixJson from "../generated-v2/modes/visible-obstacles.matrix.json";
import rulesJson from "../generated-v2/modes/visible-obstacles.rules.json";
import situationsJson from "../generated-v2/modes/visible-obstacles.situations.json";

import type {
  CharacterIdV2,
  CharacterV2,
  MovementDecision,
  SceneType,
  VisibleObstacleFeedback,
  VisibleObstacleGroupId,
  VisibleObstacleManifest,
  VisibleObstacleMatrix,
  VisibleObstacleSelectionRules,
  VisibleObstacleSituation,
  VisibleObstacleSituationId,
  VisibleObstaclesBank,
} from "../../types/editorialV2";

const CHARACTER_IDS = ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09"] as const;
const SITUATION_IDS = ["V01", "V02", "V03", "V04", "V05", "V06", "V07", "V08", "V09", "V10", "V11", "V12", "V13", "V14", "V15", "V16"] as const;
const DECISIONS = ["advance", "stay"] as const;
const SCENE_TYPES = ["direct", "climate", "protective"] as const;
const GROUP_IDS = ["collective-trivialization", "gender-expression-recognition", "outing-surveillance-rumor-digital", "aromantic-asexual-bisexual-pansexual"] as const;

type JsonObject = Record<string, unknown>;
const isObject = (value: unknown): value is JsonObject => typeof value === "object" && value !== null && !Array.isArray(value);
const fail = (location: string, message: string): never => { throw new Error(`Données éditoriales V2 invalides — ${location} : ${message}`); };
const objectAt = (value: unknown, location: string): JsonObject => isObject(value) ? value : fail(location, "objet attendu");
const arrayAt = (value: unknown, location: string): unknown[] => Array.isArray(value) ? value : fail(location, "tableau attendu");
const stringAt = (value: unknown, location: string): string => typeof value === "string" && value.length > 0 ? value : fail(location, "chaîne non vide attendue");
const numberAt = (value: unknown, location: string): number => typeof value === "number" && Number.isFinite(value) ? value : fail(location, "nombre fini attendu");
const booleanAt = (value: unknown, location: string): boolean => typeof value === "boolean" ? value : fail(location, "booléen attendu");
const stringsAt = (value: unknown, location: string): readonly string[] => arrayAt(value, location).map((item, index) => stringAt(item, `${location}[${index}]`));
const enumAt = <T extends string>(value: unknown, allowed: readonly T[], location: string): T => typeof value === "string" && allowed.includes(value as T) ? value as T : fail(location, `valeur attendue parmi ${allowed.join(", ")}`);
const characterIdAt = (value: unknown, location: string): CharacterIdV2 => enumAt(value, CHARACTER_IDS, location);
const situationIdAt = (value: unknown, location: string): VisibleObstacleSituationId => enumAt(value, SITUATION_IDS, location);
const decisionAt = (value: unknown, location: string): MovementDecision => enumAt(value, DECISIONS, location);
const groupIdAt = (value: unknown, location: string): VisibleObstacleGroupId => enumAt(value, GROUP_IDS, location);
const exactCount = (actual: number, expected: number, location: string) => { if (actual !== expected) fail(location, `${expected} éléments attendus, ${actual} trouvés`); };

function parseCharacters(value: unknown): readonly CharacterV2[] {
  const rows = arrayAt(value, "characters");
  exactCount(rows.length, 9, "characters");
  const parsed = rows.map((value, index) => {
    const item = objectAt(value, `characters[${index}]`);
    const orientation = item.orientation === undefined ? {} : { orientation: stringAt(item.orientation, `characters[${index}].orientation`) };
    return {
      id: characterIdAt(item.id, `characters[${index}].id`),
      name: stringAt(item.name, `characters[${index}].name`),
      age: numberAt(item.age, `characters[${index}].age`),
      schoolLevel: stringAt(item.schoolLevel, `characters[${index}].schoolLevel`),
      genderIdentity: stringAt(item.genderIdentity, `characters[${index}].genderIdentity`),
      ...orientation,
      pronouns: stringsAt(item.pronouns, `characters[${index}].pronouns`),
      presentation: stringAt(item.presentation, `characters[${index}].presentation`),
      gamePoints: stringsAt(item.gamePoints, `characters[${index}].gamePoints`),
    } satisfies CharacterV2;
  }).sort((left, right) => left.id.localeCompare(right.id));
  if (parsed.some((item, index) => item.id !== CHARACTER_IDS[index])) fail("characters", "identifiants manquants ou dupliqués");
  return parsed;
}

function parseSituations(value: unknown): readonly VisibleObstacleSituation[] {
  const rows = arrayAt(value, "situations");
  exactCount(rows.length, 16, "situations");
  const parsed = rows.map((value, index) => {
    const item = objectAt(value, `situations[${index}]`);
    if (item.modeId !== "visible-obstacles") fail(`situations[${index}].modeId`, "visible-obstacles attendu");
    return {
      id: situationIdAt(item.id, `situations[${index}].id`), modeId: "visible-obstacles" as const,
      title: stringAt(item.title, `situations[${index}].title`), sceneType: enumAt(item.sceneType, SCENE_TYPES, `situations[${index}].sceneType`) as SceneType,
      subfamily: stringAt(item.subfamily, `situations[${index}].subfamily`), text: stringAt(item.text, `situations[${index}].text`),
      question: stringAt(item.question, `situations[${index}].question`), mechanism: stringAt(item.mechanism, `situations[${index}].mechanism`),
      caution: stringAt(item.caution, `situations[${index}].caution`), mandatory: booleanAt(item.mandatory, `situations[${index}].mandatory`),
    } satisfies VisibleObstacleSituation;
  }).sort((left, right) => left.id.localeCompare(right.id));
  if (parsed.some((item, index) => item.id !== SITUATION_IDS[index])) fail("situations", "identifiants manquants ou dupliqués");
  return parsed;
}

function parseMatrix(value: unknown): VisibleObstacleMatrix {
  const source = objectAt(value, "matrix");
  exactCount(Object.keys(source).length, 16, "matrix");
  return Object.fromEntries(SITUATION_IDS.map((situationId) => {
    const row = objectAt(source[situationId], `matrix.${situationId}`);
    exactCount(Object.keys(row).length, 9, `matrix.${situationId}`);
    return [situationId, Object.fromEntries(CHARACTER_IDS.map((characterId) => [characterId, decisionAt(row[characterId], `matrix.${situationId}.${characterId}`)]))];
  })) as VisibleObstacleMatrix;
}

function parseFeedbacks(value: unknown): readonly VisibleObstacleFeedback[] {
  const rows = arrayAt(value, "feedbacks");
  exactCount(rows.length, 144, "feedbacks");
  const parsed = rows.map((value, index) => {
    const item = objectAt(value, `feedbacks[${index}]`);
    return { situationId: situationIdAt(item.situationId, `feedbacks[${index}].situationId`), characterId: characterIdAt(item.characterId, `feedbacks[${index}].characterId`), decision: decisionAt(item.decision, `feedbacks[${index}].decision`), explanation: stringAt(item.explanation, `feedbacks[${index}].explanation`) } satisfies VisibleObstacleFeedback;
  }).sort((left, right) => left.situationId.localeCompare(right.situationId) || left.characterId.localeCompare(right.characterId));
  const keys = new Set(parsed.map((item) => createVisibleObstacleFeedbackKey(item.situationId, item.characterId)));
  exactCount(keys.size, 144, "feedbacks uniques");
  return parsed;
}

function parseRules(value: unknown): VisibleObstacleSelectionRules {
  const item = objectAt(value, "rules");
  if (item.modeId !== "visible-obstacles") fail("rules.modeId", "visible-obstacles attendu");
  const parseGroupBase = (value: unknown, location: string) => {
    const group = objectAt(value, location);
    return { group, id: groupIdAt(group.id, location + ".id"), situationIds: arrayAt(group.situationIds, location + ".situationIds").map((id, index) => situationIdAt(id, location + ".situationIds[" + index + "]")) };
  };
  const range = objectAt(item.variableObstacleRangePerCharacter, "rules.variableObstacleRangePerCharacter");
  return {
    modeId: "visible-obstacles",
    totalSituationCount: numberAt(item.totalSituationCount, "rules.totalSituationCount"),
    variableSituationCount: numberAt(item.variableSituationCount, "rules.variableSituationCount"),
    mandatorySituationIds: arrayAt(item.mandatorySituationIds, "rules.mandatorySituationIds").map((id, index) => situationIdAt(id, `rules.mandatorySituationIds[${index}]`)),
    variableSituationIds: arrayAt(item.variableSituationIds, "rules.variableSituationIds").map((id, index) => situationIdAt(id, `rules.variableSituationIds[${index}]`)),
    requiredGroups: arrayAt(item.requiredGroups, "rules.requiredGroups").map((value, index) => { const location = "rules.requiredGroups[" + index + "]"; const { group, id, situationIds } = parseGroupBase(value, location); return { id, minimum: numberAt(group.minimum, location + ".minimum"), situationIds }; }),
    limitedGroups: arrayAt(item.limitedGroups, "rules.limitedGroups").map((value, index) => { const location = "rules.limitedGroups[" + index + "]"; const { group, id, situationIds } = parseGroupBase(value, location); return { id, maximum: numberAt(group.maximum, location + ".maximum"), situationIds }; }),
    variableObstacleRangePerCharacter: { minimum: numberAt(range.minimum, "rules.variableObstacleRangePerCharacter.minimum"), maximum: numberAt(range.maximum, "rules.variableObstacleRangePerCharacter.maximum") },
  };
}

function parseManifest(value: unknown): VisibleObstacleManifest {
  const item = objectAt(value, "manifest");
  const files = objectAt(item.files, "manifest.files");
  if (item.schemaVersion !== 1 || item.modeId !== "visible-obstacles") fail("manifest", "schéma ou mode inattendu");
  return {
    schemaVersion: 1, modeId: "visible-obstacles", sourceFiles: stringsAt(item.sourceFiles, "manifest.sourceFiles"),
    characterCount: numberAt(item.characterCount, "manifest.characterCount"), situationCount: numberAt(item.situationCount, "manifest.situationCount"),
    decisionCount: numberAt(item.decisionCount, "manifest.decisionCount"), feedbackCount: numberAt(item.feedbackCount, "manifest.feedbackCount"),
    validCombinationCount: numberAt(item.validCombinationCount, "manifest.validCombinationCount"),
    files: { characters: stringAt(files.characters, "manifest.files.characters"), situations: stringAt(files.situations, "manifest.files.situations"), matrix: stringAt(files.matrix, "manifest.files.matrix"), feedbacks: stringAt(files.feedbacks, "manifest.files.feedbacks"), rules: stringAt(files.rules, "manifest.files.rules") },
  };
}

export function createVisibleObstacleFeedbackKey(situationId: VisibleObstacleSituationId, characterId: CharacterIdV2): `${VisibleObstacleSituationId}:${CharacterIdV2}` {
  return `${situationId}:${characterId}`;
}

export const charactersV2 = parseCharacters(charactersJson);
export const visibleObstacleSituations = parseSituations(situationsJson);
export const visibleObstacleMatrix = parseMatrix(matrixJson);
export const visibleObstacleFeedbacks = parseFeedbacks(feedbacksJson);
export const visibleObstacleRules = parseRules(rulesJson);
export const visibleObstacleManifest = parseManifest(manifestJson);

export const charactersV2ById: Readonly<Record<CharacterIdV2, CharacterV2>> = Object.fromEntries(charactersV2.map((item) => [item.id, item])) as Record<CharacterIdV2, CharacterV2>;
export const visibleObstacleSituationsById: Readonly<Record<VisibleObstacleSituationId, VisibleObstacleSituation>> = Object.fromEntries(visibleObstacleSituations.map((item) => [item.id, item])) as Record<VisibleObstacleSituationId, VisibleObstacleSituation>;
export const visibleObstacleFeedbacksByKey: Readonly<Record<`${VisibleObstacleSituationId}:${CharacterIdV2}`, VisibleObstacleFeedback>> = Object.fromEntries(visibleObstacleFeedbacks.map((item) => [createVisibleObstacleFeedbackKey(item.situationId, item.characterId), item])) as Record<`${VisibleObstacleSituationId}:${CharacterIdV2}`, VisibleObstacleFeedback>;

for (const feedback of visibleObstacleFeedbacks) {
  if (!charactersV2ById[feedback.characterId] || !visibleObstacleSituationsById[feedback.situationId]) fail(`feedback ${createVisibleObstacleFeedbackKey(feedback.situationId, feedback.characterId)}`, "référence inconnue");
  if (visibleObstacleMatrix[feedback.situationId][feedback.characterId] !== feedback.decision) fail(`feedback ${createVisibleObstacleFeedbackKey(feedback.situationId, feedback.characterId)}`, "décision différente de la matrice");
}
for (const id of [...visibleObstacleRules.mandatorySituationIds, ...visibleObstacleRules.variableSituationIds, ...visibleObstacleRules.requiredGroups.flatMap((group) => group.situationIds), ...visibleObstacleRules.limitedGroups.flatMap((group) => group.situationIds)]) if (!visibleObstacleSituationsById[id]) fail("rules", `situation inconnue ${id}`);
for (const id of ["V09", "V10"] as const) if (!visibleObstacleSituationsById[id]?.mandatory) fail(id, "situation protectrice obligatoire absente");
if (visibleObstacleManifest.characterCount !== charactersV2.length || visibleObstacleManifest.situationCount !== visibleObstacleSituations.length || visibleObstacleManifest.decisionCount !== 144 || visibleObstacleManifest.feedbackCount !== visibleObstacleFeedbacks.length) fail("manifest", "comptages incohérents avec les données chargées");

export function getCharacterV2(characterId: CharacterIdV2): CharacterV2 { return charactersV2ById[characterId] ?? fail(`character ${characterId}`, "introuvable"); }
export function getVisibleObstacleSituation(situationId: VisibleObstacleSituationId): VisibleObstacleSituation { return visibleObstacleSituationsById[situationId] ?? fail(`situation ${situationId}`, "introuvable"); }
export function getVisibleObstacleDecision(situationId: VisibleObstacleSituationId, characterId: CharacterIdV2): MovementDecision { return visibleObstacleMatrix[situationId]?.[characterId] ?? fail(`matrix ${situationId}/${characterId}`, "décision introuvable"); }
export function getVisibleObstacleFeedback(situationId: VisibleObstacleSituationId, characterId: CharacterIdV2): VisibleObstacleFeedback { return visibleObstacleFeedbacksByKey[createVisibleObstacleFeedbackKey(situationId, characterId)] ?? fail(`feedback ${situationId}/${characterId}`, "introuvable"); }

export const visibleObstaclesBank: VisibleObstaclesBank = { modeId: "visible-obstacles", characters: charactersV2, situations: visibleObstacleSituations, matrix: visibleObstacleMatrix, feedbacks: visibleObstacleFeedbacks, rules: visibleObstacleRules, manifest: visibleObstacleManifest };
