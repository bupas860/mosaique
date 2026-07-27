import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const temporaryRoot = mkdtempSync("/tmp/mosaique-runtime-v2-");
const entry = join(temporaryRoot, "check.ts");
const output = join(temporaryRoot, "dist");
const runtimePath = join(root, "src/data/v2/runtimeV2.ts");

const source = `
import {
  createVisibleObstaclesGameSet,
  getPlayableCharacterV2,
  getPlayableVisibleObstacleFeedback,
  getPlayableVisibleObstacleSituation,
  getVisibleObstacleMovement,
  movementDecisionToStep,
  visibleObstaclesRuntimeBank,
} from ${JSON.stringify(runtimePath)};

const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message); };
const expectedNames = { P01: "Noé", P02: "Jade", P03: "Sam", P07: "Camille", P08: "Lou", P09: "Inès" } as const;
for (const [id, name] of Object.entries(expectedNames)) assert(getPlayableCharacterV2(id as keyof typeof expectedNames).name === name, id + " doit correspondre à " + name);
assert(visibleObstaclesRuntimeBank.characters.length === 9, "neuf personnages attendus");
assert(new Set(visibleObstaclesRuntimeBank.characters.map(({ accentColor }) => accentColor.toLowerCase())).size === 9, "neuf couleurs distinctes attendues");
assert(visibleObstaclesRuntimeBank.characters.every(({ image }) => image === null), "toutes les images de personnages doivent valoir null");
assert(getPlayableVisibleObstacleSituation("V01").id === "V01", "V01 absente");
for (const id of ["V09", "V10"] as const) { const situation = getPlayableVisibleObstacleSituation(id); assert(situation.sceneType === "protective" && situation.mandatory, id + " doit être protectrice et obligatoire"); }
assert(getPlayableVisibleObstacleSituation("V16").id === "V16", "V16 absente");
assert(visibleObstaclesRuntimeBank.situations.length === 16 && visibleObstaclesRuntimeBank.situations.every(({ image }) => image === null), "les seize images de situations doivent valoir null");
assert(getVisibleObstacleMovement("V01", "P01") === "stay", "V01/P01");
assert(getVisibleObstacleMovement("V01", "P07") === "advance", "V01/P07");
assert(getVisibleObstacleMovement("V09", "P01") === "advance", "V09/P01");
assert(getVisibleObstacleMovement("V10", "P09") === "advance", "V10/P09");
assert(movementDecisionToStep("advance") === 1 && movementDecisionToStep("stay") === 0, "conversion de mouvement invalide");
assert(getPlayableVisibleObstacleFeedback("V01", "P01").explanation.length > 0, "feedback V01/P01 absent");
assert(getPlayableVisibleObstacleFeedback("V12", "P04").decision === "stay", "feedback V12/P04 invalide");
assert(getPlayableVisibleObstacleFeedback("V16", "P08").explanation.length > 0, "feedback V16/P08 absent");
assert(visibleObstaclesRuntimeBank.feedbacks.length === 144 && Object.keys(visibleObstaclesRuntimeBank.feedbacksByKey).length === 144, "144 feedbacks attendus");
const randomFactories = [
  () => () => 0,
  () => () => 0.999999999999,
  ...[3, 17, 2026].map((seed) => () => { let state = seed; return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; }; }),
];
for (const makeRandom of randomFactories) {
  const gameSet = createVisibleObstaclesGameSet(makeRandom());
  assert(gameSet.modeId === "visible-obstacles", "mode du lot incorrect");
  assert(gameSet.situationIds.length === 10 && new Set(gameSet.situationIds).size === 10, "dix situations uniques attendues");
  assert(gameSet.situationIds.includes("V09") && gameSet.situationIds.includes("V10"), "V09 et V10 absentes du lot");
  assert(gameSet.situations.every((situation, index) => situation.id === gameSet.situationIds[index]), "ordre identifiants/objets divergent");
  assert(gameSet.situations.every((situation) => visibleObstaclesRuntimeBank.situationsById[situation.id] === situation), "situation étrangère à la banque runtime");
}
console.log("Vérification de la banque runtime V2 réussie");
console.log("Personnages : 9, couleurs distinctes : 9, images nulles : 9");
console.log("Situations : 16, images nulles : 16, mouvements : 144");
console.log("Feedbacks accessibles : 144");
console.log("Parties déterministes validées : 5");
console.log("P08 correspond à Lou et ne possède aucun portrait : oui");
`;

try {
  writeFileSync(entry, source, "utf8");
  const build = spawnSync(join(root, "node_modules/.bin/vite"), ["build", "--ssr", entry, "--outDir", output], { cwd: root, encoding: "utf8" });
  if (build.status !== 0) throw new Error(`Compilation du contrôle runtime impossible :\n${build.stdout}${build.stderr}`);
  const run = spawnSync(process.execPath, [join(output, "check.js")], { cwd: root, encoding: "utf8" });
  process.stdout.write(run.stdout);
  process.stderr.write(run.stderr);
  if (run.status !== 0) process.exitCode = run.status ?? 1;
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
