import {
  getVisibleObstacleSituation,
  visibleObstaclesBank,
} from "../data/v2/generatedV2Data";
import type {
  VisibleObstacleSituation,
  VisibleObstacleSituationId,
} from "../types/editorialV2";

export interface VisibleObstacleVariableSelectionValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface VisibleObstacleSelectionStatistics {
  readonly examinedCount: number;
  readonly validCount: number;
}

type SelectionCache = {
  readonly examinedCount: number;
  readonly validSelections: readonly (readonly VisibleObstacleSituationId[])[];
};

const EXPECTED_VARIABLE_SITUATION_COUNT = 14;
const EXPECTED_SELECTION_COUNT = 8;
const EXPECTED_TOTAL_SITUATION_COUNT = 10;
const EXPECTED_COMBINATION_COUNT = 3003;
const EXPECTED_VALID_COMBINATION_COUNT = 1123;
const REQUIRED_MANDATORY_IDS = ["V09", "V10"] as const;
let selectionCache: SelectionCache | undefined;

function bankError(message: string): never {
  throw new Error(`Banque visible-obstacles incohérente — ${message}`);
}

function assertBankStructure(): void {
  const { characters, situations, matrix, rules } = visibleObstaclesBank;
  const situationIds = new Set(situations.map(({ id }) => id));
  const variableIds = new Set(rules.variableSituationIds);
  const mandatoryIds = new Set(rules.mandatorySituationIds);

  if (rules.variableSituationCount !== EXPECTED_SELECTION_COUNT) bankError(`variableSituationCount doit valoir ${EXPECTED_SELECTION_COUNT}`);
  if (rules.totalSituationCount !== EXPECTED_TOTAL_SITUATION_COUNT) bankError(`totalSituationCount doit valoir ${EXPECTED_TOTAL_SITUATION_COUNT}`);
  if (rules.variableSituationIds.length !== EXPECTED_VARIABLE_SITUATION_COUNT || variableIds.size !== EXPECTED_VARIABLE_SITUATION_COUNT) bankError(`${EXPECTED_VARIABLE_SITUATION_COUNT} situations variables uniques attendues`);
  if (rules.mandatorySituationIds.length !== REQUIRED_MANDATORY_IDS.length || mandatoryIds.size !== REQUIRED_MANDATORY_IDS.length || REQUIRED_MANDATORY_IDS.some((id) => !mandatoryIds.has(id))) bankError("les situations obligatoires doivent être exactement V09 et V10");

  for (const id of REQUIRED_MANDATORY_IDS) {
    const situation = situations.find((candidate) => candidate.id === id);
    if (!situation) bankError(`${id} est absente`);
    if (!situation.mandatory) bankError(`${id} doit être marquée obligatoire`);
  }
  for (const id of variableIds) {
    if (!situationIds.has(id)) bankError(`situation variable inconnue : ${id}`);
    if (mandatoryIds.has(id)) bankError(`${id} est à la fois variable et obligatoire`);
  }
  for (const group of [...rules.requiredGroups, ...rules.limitedGroups]) {
    for (const id of group.situationIds) if (!situationIds.has(id)) bankError(`la règle ${group.id} référence une situation inconnue : ${id}`);
  }
  for (const id of situations.map((situation) => situation.id)) {
    for (const character of characters) {
      const decision = matrix[id]?.[character.id];
      if (decision !== "advance" && decision !== "stay") bankError(`décision manquante ou invalide : ${id}/${character.id}`);
    }
  }
}

export function validateVisibleObstacleVariableSelection(
  situationIds: readonly VisibleObstacleSituationId[],
): VisibleObstacleVariableSelectionValidation {
  assertBankStructure();
  const { characters, matrix, rules } = visibleObstaclesBank;
  const errors: string[] = [];
  const selected = new Set(situationIds);
  const variableIds = new Set(rules.variableSituationIds);

  if (situationIds.length !== rules.variableSituationCount) errors.push(`${rules.variableSituationCount} situations variables attendues`);
  if (selected.size !== situationIds.length) errors.push("les identifiants doivent être uniques");
  for (const id of selected) if (!variableIds.has(id)) errors.push(`${id} n’appartient pas aux situations variables`);
  for (const group of rules.requiredGroups) {
    const count = group.situationIds.filter((id) => selected.has(id)).length;
    if (count < group.minimum) errors.push(`groupe requis ${group.id} : minimum ${group.minimum}, résultat ${count}`);
  }
  for (const group of rules.limitedGroups) {
    const count = group.situationIds.filter((id) => selected.has(id)).length;
    if (count > group.maximum) errors.push(`groupe limité ${group.id} : maximum ${group.maximum}, résultat ${count}`);
  }
  if (situationIds.every((id) => variableIds.has(id))) {
    const { minimum, maximum } = rules.variableObstacleRangePerCharacter;
    for (const character of characters) {
      const stayCount = situationIds.filter((id) => matrix[id][character.id] === "stay").length;
      if (stayCount < minimum || stayCount > maximum) errors.push(`${character.id} : ${stayCount} stay variables, plage attendue ${minimum}–${maximum}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function isValidVisibleObstacleVariableSelection(
  situationIds: readonly VisibleObstacleSituationId[],
): boolean {
  return validateVisibleObstacleVariableSelection(situationIds).valid;
}

function enumerateCombinations(
  values: readonly VisibleObstacleSituationId[],
  size: number,
): readonly (readonly VisibleObstacleSituationId[])[] {
  const combinations: VisibleObstacleSituationId[][] = [];
  const visit = (start: number, current: VisibleObstacleSituationId[]) => {
    if (current.length === size) {
      combinations.push([...current]);
      return;
    }
    for (let index = start; index <= values.length - (size - current.length); index += 1) {
      current.push(values[index]);
      visit(index + 1, current);
      current.pop();
    }
  };
  visit(0, []);
  return combinations;
}

function getSelectionCache(): SelectionCache {
  if (selectionCache) return selectionCache;
  assertBankStructure();
  const combinations = enumerateCombinations(visibleObstaclesBank.rules.variableSituationIds, visibleObstaclesBank.rules.variableSituationCount);
  if (combinations.length !== EXPECTED_COMBINATION_COUNT) bankError(`${EXPECTED_COMBINATION_COUNT} combinaisons attendues avant filtrage, ${combinations.length} calculées`);
  const validSelections = combinations.filter(isValidVisibleObstacleVariableSelection).map((selection) => Object.freeze([...selection]));
  if (validSelections.length === 0) bankError("aucune combinaison valide");
  if (validSelections.length !== EXPECTED_VALID_COMBINATION_COUNT) bankError(`${EXPECTED_VALID_COMBINATION_COUNT} combinaisons valides attendues, ${validSelections.length} calculées`);
  selectionCache = Object.freeze({ examinedCount: combinations.length, validSelections: Object.freeze(validSelections) });
  return selectionCache;
}

export function getValidVisibleObstacleVariableSelections(): readonly (readonly VisibleObstacleSituationId[])[] {
  return getSelectionCache().validSelections;
}

export function getVisibleObstacleSelectionStatistics(): VisibleObstacleSelectionStatistics {
  const cache = getSelectionCache();
  return { examinedCount: cache.examinedCount, validCount: cache.validSelections.length };
}

function randomValue(random: () => number): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error(`La fonction aléatoire doit retourner une valeur comprise entre 0 inclus et 1 exclu ; valeur reçue : ${String(value)}`);
  return value;
}

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(randomValue(random) * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

export function selectVisibleObstacleSituationIds(
  random: () => number = Math.random,
): readonly VisibleObstacleSituationId[] {
  const validSelections = getValidVisibleObstacleVariableSelections();
  const selectionIndex = Math.floor(randomValue(random) * validSelections.length);
  const selected = validSelections[selectionIndex];
  const result = shuffled([...selected, ...visibleObstaclesBank.rules.mandatorySituationIds], random);
  if (result.length !== EXPECTED_TOTAL_SITUATION_COUNT || new Set(result).size !== EXPECTED_TOTAL_SITUATION_COUNT) bankError("le lot final ne contient pas dix situations uniques");
  return result;
}

export function selectVisibleObstacleSituations(
  random: () => number = Math.random,
): readonly VisibleObstacleSituation[] {
  return selectVisibleObstacleSituationIds(random).map(getVisibleObstacleSituation);
}
