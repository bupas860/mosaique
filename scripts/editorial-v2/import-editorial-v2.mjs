import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import { GALLERIES, MODES, ROOT, SOURCE_FILES } from "./editorial-config.mjs";
import { parseEditorialV2 } from "./parse-editorial-v2.mjs";
import { assertSelectionReferences } from "./selection-analysis.mjs";
import { validateEditorialV2 } from "./validate-editorial-v2.mjs";

export const DEFAULT_OUTPUT_ROOT = join(ROOT, "src/data/generated-v2");
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

function assertSerializable(value, location = "racine") {
  if (value === undefined) throw new Error(`${location} contient undefined`);
  if (typeof value === "number" && !Number.isFinite(value)) throw new Error(`${location} contient un nombre non fini`);
  if (Array.isArray(value)) value.forEach((item, index) => assertSerializable(item, `${location}[${index}]`));
  else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => assertSerializable(item, `${location}.${key}`));
}

function sortGallery(gallery, config) {
  const byId = new Map(gallery.characters.map((character) => [character.id, character]));
  return {
    schemaVersion: 2,
    galleryId: gallery.id,
    documentId: gallery.documentId,
    sourceFile: gallery.sourceFile,
    characters: config.characterIds.map((id) => byId.get(id)),
  };
}

function normalizedMode(mode, config, selection) {
  if (mode.id === "discovery") {
    return {
      schemaVersion: 2,
      modeId: mode.id,
      bankType: "transversal",
      documentId: mode.documentId,
      sourceFile: mode.sourceFile,
      galleryId: mode.galleryId,
      situations: [],
      references: mode.references,
      rules: mode.rules,
      validSelectionCountsByCharacter: Object.fromEntries(Object.entries(selection).map(([id, result]) => [id, result.validCount])),
    };
  }
  const characterIds = GALLERIES[config.galleryId].characterIds;
  const byId = new Map(mode.situations.map((situation) => [situation.id, situation]));
  return {
    schemaVersion: 2,
    modeId: mode.id,
    bankType: "standalone",
    documentId: mode.documentId,
    sourceFile: mode.sourceFile,
    galleryId: mode.galleryId,
    situations: config.situationIds.map((id) => {
      const situation = byId.get(id);
      return {
        ...situation,
        effectsByCharacter: Object.fromEntries(characterIds.map((characterId) => [characterId, situation.effectsByCharacter[characterId]])),
        feedbacksByCharacter: Object.fromEntries(characterIds.map((characterId) => [characterId, situation.feedbacksByCharacter[characterId]])),
      };
    }),
    rules: mode.rules,
    selectionStatistics: {
      examinedCount: selection.examinedCount,
      thematicCount: selection.thematicCount,
      validForAllCharactersCount: selection.validForAllCharactersCount,
      validCountsByCharacter: selection.countsByCharacter,
    },
  };
}

function visibleCompatibility(data, selection) {
  const characters = data.galleries.general.characters;
  const bank = data.modes["visible-obstacles"];
  const config = MODES["visible-obstacles"];
  const sceneTypes = new Map([["Scène directe", "direct"], ["Scène de climat", "climate"], ["Scène protectrice fixe", "protective"]]);
  const situations = bank.situations.map((item) => ({
    id: item.id,
    modeId: item.modeId,
    title: item.title,
    sceneType: sceneTypes.get(item.sceneType),
    subfamily: item.subfamily,
    text: item.playerText,
    question: item.question,
    mechanism: item.mechanism,
    caution: item.vigilance,
    mandatory: item.mandatory,
  }));
  const matrix = Object.fromEntries(bank.situations.map((item) => [item.id, item.effectsByCharacter]));
  const feedbacks = bank.situations.flatMap((item) => GALLERIES.general.characterIds.map((characterId) => ({
    situationId: item.id,
    characterId,
    ...item.feedbacksByCharacter[characterId],
  })));
  const groupIds = ["collective-trivialization", "gender-expression-recognition", "outing-surveillance-rumor-digital", "aromantic-asexual-bisexual-pansexual"];
  const rules = {
    modeId: bank.id,
    totalSituationCount: 10,
    variableSituationCount: config.variableCount,
    mandatorySituationIds: config.mandatoryIds,
    variableSituationIds: config.variableIds,
    requiredGroups: config.requiredGroups.map((situationIds, index) => ({ id: groupIds[index], minimum: 1, situationIds })),
    limitedGroups: [{ id: groupIds[2], maximum: 2, situationIds: config.limitedGroups[0].situationIds }],
    variableObstacleRangePerCharacter: { minimum: 1, maximum: 7 },
  };
  const manifest = {
    schemaVersion: 1,
    modeId: bank.id,
    sourceFiles: [GALLERIES.general.sourceFile, bank.sourceFile],
    characterCount: characters.length,
    situationCount: situations.length,
    decisionCount: situations.length * characters.length,
    feedbackCount: feedbacks.length,
    validCombinationCount: selection.validForAllCharactersCount,
    files: {
      characters: "../characters.json",
      situations: "visible-obstacles.situations.json",
      matrix: "visible-obstacles.matrix.json",
      feedbacks: "visible-obstacles.feedbacks.json",
      rules: "visible-obstacles.rules.json",
    },
  };
  return { characters, situations, matrix, feedbacks, rules, manifest };
}

export function buildEditorialV2Outputs(data = parseEditorialV2()) {
  const validation = validateEditorialV2(data);
  if (!validation.valid) throw new Error(`Validation éditoriale V2 échouée avant écriture :\n${validation.errors.map((item) => `- ${item}`).join("\n")}`);
  const analyses = assertSelectionReferences(data).analyses;
  const values = new Map();
  for (const [galleryId, config] of Object.entries(GALLERIES)) values.set(`galleries/${galleryId}.json`, sortGallery(data.galleries[galleryId], config));
  for (const [modeId, config] of Object.entries(MODES)) values.set(`modes/${modeId}.json`, normalizedMode(data.modes[modeId], config, analyses[modeId]));
  values.set("index.json", {
    schemaVersion: 2,
    sourceFiles: SOURCE_FILES,
    galleries: Object.fromEntries(Object.keys(GALLERIES).map((id) => [id, `galleries/${id}.json`])),
    modes: Object.fromEntries(Object.keys(MODES).map((id) => [id, `modes/${id}.json`])),
  });
  const compatibility = visibleCompatibility(data, analyses["visible-obstacles"]);
  values.set("characters.json", compatibility.characters);
  values.set("modes/visible-obstacles.situations.json", compatibility.situations);
  values.set("modes/visible-obstacles.matrix.json", compatibility.matrix);
  values.set("modes/visible-obstacles.feedbacks.json", compatibility.feedbacks);
  values.set("modes/visible-obstacles.rules.json", compatibility.rules);
  values.set("modes/visible-obstacles.manifest.json", compatibility.manifest);

  const files = new Map();
  for (const [relativePath, value] of values) {
    assertSerializable(value, relativePath);
    const serialized = json(value);
    JSON.parse(serialized);
    if (serialized.includes("/home/")) throw new Error(`${relativePath} contient un chemin local absolu`);
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
    console.log("Import éditorial V2 réussi");
    console.log(`Fichiers générés : ${files.size}`);
    console.log(`Galeries : ${validation.summary.galleryCount}`);
    console.log(`Modes : ${validation.summary.modeCount}`);
    console.log(`Situations : ${validation.summary.situationCount}`);
    console.log(`Décisions : ${validation.summary.decisionCount}`);
    console.log(`Feedbacks : ${validation.summary.feedbackCount}`);
  } catch (cause) {
    console.error(`Import éditorial V2 impossible : ${cause instanceof Error ? cause.message : String(cause)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
