import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parseEditorialV2 } from "./parse-editorial-v2.mjs";
import { validateEditorialV2 } from "./validate-editorial-v2.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const DEFAULT_OUTPUT_ROOT = join(ROOT, "src/data/generated-v2");
const CHARACTER_IDS = Array.from({ length: 9 }, (_, index) => `P${String(index + 1).padStart(2, "0")}`);
const SITUATION_IDS = Array.from({ length: 16 }, (_, index) => `V${String(index + 1).padStart(2, "0")}`);
const MANDATORY_IDS = ["V09", "V10"];
const SOURCE_FILES = ["docs/editorial-v2/010_Galerie_des_personnages_V2.md", "docs/editorial-v2/100_Mode_Obstacles_visibles_V1.md"];
const QUESTION = "Dans cette situation, que se passe-t-il pour [Prénom] ?";
const SCENE_TYPES = new Map([["Scène directe", "direct"], ["Scène de climat", "climate"], ["Scène protectrice fixe", "protective"]]);
const GROUP_IDS = ["collective-trivialization", "gender-expression-recognition", "outing-surveillance-rumor-digital", "aromantic-asexual-bisexual-pansexual"];

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function assertSerializable(value, location = "racine") {
  if (value === undefined) throw new Error(`${location} contient undefined`);
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error(`${location} contient un nombre non fini`);
  if (Array.isArray(value)) value.forEach((item, index) => assertSerializable(item, `${location}[${index}]`));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => assertSerializable(item, `${location}.${key}`));
}

function sortedCharacters(characters) {
  const byId = new Map(characters.map((character) => [character.id, character]));
  return CHARACTER_IDS.map((id) => {
    const character = byId.get(id);
    const result = { id: character.id, name: character.name, age: character.age, schoolLevel: character.schoolLevel, genderIdentity: character.genderIdentity };
    if (character.orientation !== undefined) result.orientation = character.orientation;
    result.pronouns = [...character.pronouns];
    result.presentation = character.presentation;
    result.gamePoints = [...character.gamePoints];
    return result;
  });
}

function sortedSituations(situations) {
  const byId = new Map(situations.map((situation) => [situation.id, situation]));
  return SITUATION_IDS.map((id) => {
    const situation = byId.get(id);
    const sceneType = SCENE_TYPES.get(situation.sceneType);
    if (!sceneType) throw new Error(`${id} : type de scène non normalisable « ${situation.sceneType} »`);
    if (situation.question !== QUESTION) throw new Error(`${id} : formulation de question inattendue`);
    return { id, modeId: "visible-obstacles", title: situation.title, sceneType, subfamily: situation.subfamily, text: situation.text, question: situation.question, mechanism: situation.mechanism, caution: situation.caution, mandatory: situation.mandatory };
  });
}

function sortedMatrix(matrix) {
  return Object.fromEntries(SITUATION_IDS.map((situationId) => [situationId, Object.fromEntries(CHARACTER_IDS.map((characterId) => [characterId, matrix[situationId][characterId]]))]));
}

function sortedFeedbacks(feedbacks) {
  const byPair = new Map(feedbacks.map((feedback) => [`${feedback.situationId}/${feedback.characterId}`, feedback]));
  return SITUATION_IDS.flatMap((situationId) => CHARACTER_IDS.map((characterId) => {
    const feedback = byPair.get(`${situationId}/${characterId}`);
    return { situationId, characterId, decision: feedback.decision, explanation: feedback.explanation };
  }));
}

function generatedRules(selectionRules) {
  return {
    modeId: "visible-obstacles",
    totalSituationCount: selectionRules.totalSituationCount,
    variableSituationCount: selectionRules.variableSituationCount,
    mandatorySituationIds: [...MANDATORY_IDS],
    variableSituationIds: SITUATION_IDS.filter((id) => !MANDATORY_IDS.includes(id)),
    requiredGroups: selectionRules.requiredGroups.map((situationIds, index) => ({ id: GROUP_IDS[index], minimum: 1, situationIds: [...situationIds] })),
    limitedGroups: [{ id: GROUP_IDS[2], maximum: selectionRules.limitedGroup.maximum, situationIds: [...selectionRules.limitedGroup.situationIds] }],
    variableObstacleRangePerCharacter: { ...selectionRules.variableObstacleRangePerCharacter },
  };
}

export function buildEditorialV2Outputs(data = parseEditorialV2()) {
  const validation = validateEditorialV2(data);
  if (!validation.valid) throw new Error(`Validation éditoriale V2 échouée avant écriture :\n${validation.errors.map((item) => `- ${item}`).join("\n")}`);
  const characters = sortedCharacters(data.characters);
  const situations = sortedSituations(data.mode.situations);
  const matrix = sortedMatrix(data.mode.matrix);
  const feedbacks = sortedFeedbacks(data.mode.feedbacks);
  const rules = generatedRules(data.mode.selectionRules);
  const manifest = {
    schemaVersion: 1,
    modeId: "visible-obstacles",
    sourceFiles: SOURCE_FILES,
    characterCount: validation.summary.characterCount,
    situationCount: validation.summary.situationCount,
    decisionCount: validation.summary.decisionCount,
    feedbackCount: validation.summary.feedbackCount,
    validCombinationCount: validation.summary.validCombinationCount,
    files: { characters: "../characters.json", situations: "visible-obstacles.situations.json", matrix: "visible-obstacles.matrix.json", feedbacks: "visible-obstacles.feedbacks.json", rules: "visible-obstacles.rules.json" },
  };
  const values = new Map([
    ["characters.json", characters],
    ["modes/visible-obstacles.situations.json", situations],
    ["modes/visible-obstacles.matrix.json", matrix],
    ["modes/visible-obstacles.feedbacks.json", feedbacks],
    ["modes/visible-obstacles.rules.json", rules],
    ["modes/visible-obstacles.manifest.json", manifest],
  ]);
  const files = new Map();
  for (const [relativePath, value] of values) {
    assertSerializable(value, relativePath);
    const serialized = json(value);
    JSON.parse(serialized);
    if (serialized.includes("/home/")) throw new Error(`${relativePath} contient un chemin local absolu`);
    if (!serialized.endsWith("\n")) throw new Error(`${relativePath} ne se termine pas par une nouvelle ligne`);
    files.set(relativePath, serialized);
  }
  return { validation, files };
}

export function importEditorialV2(options = {}) {
  const outputRoot = options.outputRoot ?? DEFAULT_OUTPUT_ROOT;
  const built = buildEditorialV2Outputs(options.data);
  const parent = dirname(outputRoot);
  mkdirSync(parent, { recursive: true });
  const temporaryRoot = mkdtempSync(join(parent, ".generated-v2-"));
  const backupRoot = `${temporaryRoot}-backup`;
  let previousMoved = false;
  try {
    for (const [relativePath, contents] of built.files) {
      const destination = join(temporaryRoot, relativePath);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, contents, "utf8");
      if (readFileSync(destination, "utf8") !== contents) throw new Error(`Écriture incomplète : ${relativePath}`);
    }
    if (existsSync(outputRoot)) { renameSync(outputRoot, backupRoot); previousMoved = true; }
    renameSync(temporaryRoot, outputRoot);
    if (previousMoved) rmSync(backupRoot, { recursive: true, force: true });
  } catch (cause) {
    if (existsSync(temporaryRoot)) rmSync(temporaryRoot, { recursive: true, force: true });
    if (previousMoved && !existsSync(outputRoot) && existsSync(backupRoot)) renameSync(backupRoot, outputRoot);
    throw cause;
  } finally {
    if (existsSync(temporaryRoot)) rmSync(temporaryRoot, { recursive: true, force: true });
    if (existsSync(backupRoot)) rmSync(backupRoot, { recursive: true, force: true });
  }
  return built;
}

function main() {
  try {
    const { validation, files } = importEditorialV2();
    console.log(`Import éditorial V2 réussi\n\nFichiers générés : ${files.size}\nPersonnages : ${validation.summary.characterCount}\nSituations : ${validation.summary.situationCount}\nDécisions : ${validation.summary.decisionCount}\nFeedbacks : ${validation.summary.feedbackCount}\nCombinaisons valides : ${validation.summary.validCombinationCount}`);
  } catch (cause) {
    console.error(`Import éditorial V2 impossible : ${cause instanceof Error ? cause.message : String(cause)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
