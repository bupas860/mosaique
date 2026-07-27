import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const temporaryRoot = mkdtempSync("/tmp/mosaique-visible-obstacles-");
const entry = join(temporaryRoot, "check.ts");
const output = join(temporaryRoot, "dist");
const enginePath = join(root, "src/engine/selectVisibleObstaclesSituations.ts");
const dataPath = join(root, "src/data/v2/index.ts");

const source = `
import {
  getValidVisibleObstacleVariableSelections,
  getVisibleObstacleSelectionStatistics,
  isValidVisibleObstacleVariableSelection,
  selectVisibleObstacleSituationIds,
  selectVisibleObstacleSituations,
} from ${JSON.stringify(enginePath)};
import { visibleObstaclesBank } from ${JSON.stringify(dataPath)};

const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message); };
const statistics = getVisibleObstacleSelectionStatistics();
assert(statistics.examinedCount === 3003, "3 003 combinaisons doivent être examinées");
assert(statistics.validCount === 1123, "1 123 combinaisons doivent être valides");
const combinations = getValidVisibleObstacleVariableSelections();
assert(combinations.length === 1123, "cache exhaustif incomplet");
for (const combination of combinations) {
  assert(combination.length === 8, "une combinaison ne contient pas huit situations");
  assert(new Set(combination).size === 8, "doublon dans une combinaison");
  assert(!combination.includes("V09") && !combination.includes("V10"), "situation obligatoire dans un lot variable");
  assert(isValidVisibleObstacleVariableSelection(combination), "combinaison mise en cache invalide");
}

const sourceSnapshot = JSON.stringify({ rules: visibleObstaclesBank.rules, situations: visibleObstaclesBank.situations, matrix: visibleObstaclesBank.matrix });
const validateGame = (ids: readonly string[]) => {
  assert(ids.length === 10 && new Set(ids).size === 10, "la partie doit contenir dix identifiants uniques");
  assert(ids.includes("V09") && ids.includes("V10"), "V09 et V10 doivent être présentes");
  const variables = ids.filter((id) => id !== "V09" && id !== "V10");
  assert(isValidVisibleObstacleVariableSelection(variables as Parameters<typeof isValidVisibleObstacleVariableSelection>[0]), "lot variable final invalide");
};
const zero = selectVisibleObstacleSituationIds(() => 0);
const nearOne = selectVisibleObstacleSituationIds(() => 0.999999999999);
validateGame(zero);
validateGame(nearOne);
assert(zero.indexOf("V09") !== nearOne.indexOf("V09") || zero.indexOf("V10") !== nearOne.indexOf("V10"), "les situations obligatoires restent aux mêmes positions");
for (const seed of [1, 7, 42, 2026]) {
  let state = seed;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  validateGame(selectVisibleObstacleSituationIds(random));
}
const selectedObjects = selectVisibleObstacleSituations(() => 0.25);
assert(selectedObjects.length === 10 && selectedObjects.every((item) => item.modeId === "visible-obstacles"), "sélection des objets invalide");
assert(JSON.stringify({ rules: visibleObstaclesBank.rules, situations: visibleObstaclesBank.situations, matrix: visibleObstaclesBank.matrix }) === sourceSnapshot, "les données sources ont été modifiées");
for (const invalid of [-0.1, 1, Number.NaN, Number.POSITIVE_INFINITY]) {
  let rejected = false;
  try { selectVisibleObstacleSituationIds(() => invalid); } catch { rejected = true; }
  assert(rejected, "valeur aléatoire invalide non rejetée : " + String(invalid));
}
console.log("Vérification du tirage Obstacles visibles réussie");
console.log("Combinaisons examinées : " + statistics.examinedCount);
console.log("Combinaisons valides : " + statistics.validCount);
console.log("Sélections déterministes : 0, proche de 1 et 4 graines conformes");
console.log("Valeurs aléatoires invalides rejetées : -0.1, 1, NaN, Infinity");
console.log("Données sources non modifiées : oui");
`;

try {
  writeFileSync(entry, source, "utf8");
  const build = spawnSync(join(root, "node_modules/.bin/vite"), ["build", "--ssr", entry, "--outDir", output], { cwd: root, encoding: "utf8" });
  if (build.status !== 0) throw new Error(`Compilation du contrôle impossible :\n${build.stdout}${build.stderr}`);
  const run = spawnSync(process.execPath, [join(output, "check.js")], { cwd: root, encoding: "utf8" });
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);
  if (run.status !== 0) process.exitCode = run.status ?? 1;
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
