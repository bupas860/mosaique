import { pathToFileURL } from "node:url";
import { parseEditorialV2 } from "./parse-editorial-v2.mjs";

export const EXPECTED_CHARACTERS = { P01: "Noé", P02: "Jade", P03: "Sam", P04: "Arthur", P05: "Sofia", P06: "Mehdi", P07: "Camille", P08: "Lou", P09: "Inès" };
export const EXPECTED_STAY_TOTALS = { P01: 9, P02: 9, P03: 12, P04: 9, P05: 5, P06: 8, P07: 4, P08: 5, P09: 10 };
const CHARACTER_IDS = Object.keys(EXPECTED_CHARACTERS);
const SITUATION_IDS = Array.from({ length: 16 }, (_, index) => `V${String(index + 1).padStart(2, "0")}`);
const MANDATORY_IDS = ["V09", "V10"];
const VALID_DECISIONS = new Set(["advance", "stay"]);
const sameSet = (actual, expected) => actual.length === expected.length && expected.every((value) => actual.includes(value));
const combinations = (items, size, start = 0, prefix = [], result = []) => {
  if (prefix.length === size) result.push(prefix);
  else for (let index = start; index <= items.length - (size - prefix.length); index += 1) combinations(items, size, index + 1, [...prefix, items[index]], result);
  return result;
};

export function validateEditorialV2(data, options = {}) {
  const errors = [];
  const error = (message) => errors.push(message);
  const expectedTotals = options.expectedStayTotals ?? EXPECTED_STAY_TOTALS;
  const { characters = [], mode = {} } = data ?? {};
  const { situations = [], matrix = {}, feedbacks = [], selectionRules = {} } = mode;

  if (characters.length !== 9) error(`Personnages : 9 attendus, ${characters.length} trouvés`);
  const characterIds = characters.map((item) => item.id);
  if (!sameSet(characterIds, CHARACTER_IDS)) error(`Personnages : identifiants attendus ${CHARACTER_IDS.join(", ")}, trouvés ${characterIds.join(", ")}`);
  if (new Set(characterIds).size !== characterIds.length) error("Personnages : identifiant dupliqué");
  const names = characters.map((item) => item.name);
  if (new Set(names).size !== names.length) error("Personnages : prénom dupliqué");
  for (const character of characters) {
    if (EXPECTED_CHARACTERS[character.id] !== character.name) error(`${character.id} : prénom attendu « ${EXPECTED_CHARACTERS[character.id]} », trouvé « ${character.name} »`);
    if (!Number.isFinite(character.age)) error(`${character.id} : âge absent ou non numérique`);
    if (!character.schoolLevel) error(`${character.id} : classe absente`);
    if (!character.genderIdentity) error(`${character.id} : identité de genre absente`);
    if (!character.presentation?.trim()) error(`${character.id} : présentation vide`);
    if (!character.gamePoints?.length) error(`${character.id} : aucun point important pour le jeu`);
    const expectedPronouns = character.id === "P03" ? ["iel"] : [];
    if (JSON.stringify(character.pronouns) !== JSON.stringify(expectedPronouns)) error(`${character.id} : pronoms attendus ${JSON.stringify(expectedPronouns)}, trouvés ${JSON.stringify(character.pronouns)}`);
  }

  if (situations.length !== 16) error(`Situations : 16 attendues, ${situations.length} trouvées`);
  const situationIds = situations.map((item) => item.id);
  if (!sameSet(situationIds, SITUATION_IDS)) error(`Situations : identifiants attendus ${SITUATION_IDS.join(", ")}, trouvés ${situationIds.join(", ")}`);
  if (new Set(situationIds).size !== situationIds.length) error("Situations : identifiant dupliqué");
  for (const situation of situations) {
    for (const [field, label] of [["title", "titre"], ["sceneType", "type de scène"], ["subfamily", "sous-famille"], ["text", "texte"], ["mechanism", "mécanisme"], ["caution", "point de vigilance"]]) if (!situation[field]?.trim()) error(`${situation.id} : ${label} absent`);
    const shouldBeMandatory = MANDATORY_IDS.includes(situation.id);
    if (situation.mandatory !== shouldBeMandatory) error(`${situation.id} : mandatory devrait valoir ${shouldBeMandatory}`);
  }

  const matrixIds = Object.keys(matrix);
  if (matrixIds.length !== 16) error(`Matrice : 16 lignes attendues, ${matrixIds.length} trouvées`);
  if (!sameSet(matrixIds, SITUATION_IDS)) error("Matrice : situations manquantes ou supplémentaires");
  let decisionCount = 0;
  for (const situationId of matrixIds) {
    const rowIds = Object.keys(matrix[situationId] ?? {});
    decisionCount += rowIds.length;
    if (!sameSet(rowIds, CHARACTER_IDS)) error(`Matrice ${situationId} : personnages manquants ou supplémentaires`);
    for (const characterId of rowIds) if (!VALID_DECISIONS.has(matrix[situationId][characterId])) error(`Matrice ${situationId}/${characterId} : décision « ${matrix[situationId][characterId]} » invalide`);
  }
  if (decisionCount !== 144) error(`Matrice : 144 décisions attendues, ${decisionCount} trouvées`);

  if (feedbacks.length !== 144) error(`Feedbacks : 144 attendus, ${feedbacks.length} trouvés`);
  const feedbackKeys = new Set();
  for (const feedback of feedbacks) {
    const key = `${feedback.situationId}/${feedback.characterId}`;
    if (feedbackKeys.has(key)) error(`Feedback dupliqué : ${key}`);
    feedbackKeys.add(key);
    if (!feedback.explanation?.trim()) error(`Feedback ${key} : explication vide`);
    if (!VALID_DECISIONS.has(feedback.decision)) error(`Feedback ${key} : décision « ${feedback.decision} » invalide`);
    const matrixDecision = matrix[feedback.situationId]?.[feedback.characterId];
    if (matrixDecision !== feedback.decision) error(`Divergence ${feedback.situationId} / ${feedback.characterId} :\n- matrice : ${matrixDecision ?? "absente"}\n- feedback : ${feedback.decision}`);
  }
  for (const situationId of SITUATION_IDS) for (const characterId of CHARACTER_IDS) if (!feedbackKeys.has(`${situationId}/${characterId}`)) error(`Feedback manquant : ${situationId}/${characterId}`);

  for (const situationId of MANDATORY_IDS) {
    if (!situations.find((item) => item.id === situationId)?.mandatory) error(`${situationId} doit être obligatoire`);
    for (const characterId of CHARACTER_IDS) if (matrix[situationId]?.[characterId] !== "advance") error(`${situationId}/${characterId} doit être advance`);
  }
  for (const characterId of CHARACTER_IDS) {
    const actual = SITUATION_IDS.filter((situationId) => matrix[situationId]?.[characterId] === "stay").length;
    if (actual !== expectedTotals[characterId]) error(`Total stay ${characterId} ${EXPECTED_CHARACTERS[characterId]} : ${expectedTotals[characterId]} attendu, ${actual} trouvé`);
  }

  if (selectionRules.totalSituationCount !== 10) error("Règles : totalSituationCount doit valoir 10");
  if (selectionRules.variableSituationCount !== 8) error("Règles : variableSituationCount doit valoir 8");
  if (!sameSet(selectionRules.mandatorySituationIds ?? [], MANDATORY_IDS)) error("Règles : situations obligatoires attendues V09, V10");
  const expectedGroups = [["V01", "V02"], ["V03", "V04", "V12"], ["V05", "V13", "V14", "V15"], ["V06", "V07"]];
  if (JSON.stringify(selectionRules.requiredGroups) !== JSON.stringify(expectedGroups)) error("Règles : groupes requis inattendus");
  if (!sameSet(selectionRules.limitedGroup?.situationIds ?? [], expectedGroups[2]) || selectionRules.limitedGroup?.maximum !== 2) error("Règles : groupe limité inattendu");
  if (selectionRules.variableObstacleRangePerCharacter?.minimum !== 1 || selectionRules.variableObstacleRangePerCharacter?.maximum !== 7) error("Règles : plage d’obstacles variable attendue 1 à 7");

  const variableIds = SITUATION_IDS.filter((id) => !MANDATORY_IDS.includes(id));
  const validCombinationCount = combinations(variableIds, 8).filter((candidate) => {
    const unique = new Set(candidate);
    if (unique.size !== 8) return false;
    if (!expectedGroups.every((group) => group.some((id) => unique.has(id)))) return false;
    if (expectedGroups[2].filter((id) => unique.has(id)).length > 2) return false;
    return CHARACTER_IDS.every((characterId) => {
      const stays = candidate.filter((id) => matrix[id]?.[characterId] === "stay").length;
      return stays >= 1 && stays <= 7;
    });
  }).length;
  if (validCombinationCount !== 1123) error(`Combinaisons valides : 1123 attendues, ${validCombinationCount} trouvées`);

  return { valid: errors.length === 0, errors, summary: { characterCount: characters.length, situationCount: situations.length, decisionCount, feedbackCount: feedbacks.length, validCombinationCount } };
}

function main() {
  try {
    const result = validateEditorialV2(parseEditorialV2());
    if (!result.valid) {
      console.error("Validation éditoriale V2 échouée\n");
      result.errors.forEach((message) => console.error(`- ${message}`));
      process.exitCode = 1;
      return;
    }
    console.log(`Validation éditoriale V2 réussie\n\nPersonnages : ${result.summary.characterCount}\nSituations : ${result.summary.situationCount}\nDécisions : ${result.summary.decisionCount}\nFeedbacks : ${result.summary.feedbackCount}\nSituations obligatoires : V09, V10\nCombinaisons valides : ${result.summary.validCombinationCount}\nTotaux d’obstacles : conformes\nMatrice et feedbacks : concordants`);
  } catch (cause) {
    console.error(`Validation éditoriale V2 impossible : ${cause instanceof Error ? cause.message : String(cause)}`);
    process.exitCode = 1;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
