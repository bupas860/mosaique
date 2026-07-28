import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const temporaryRoot = mkdtempSync("/tmp/mosaique-runtime-v2-");
const entry = join(temporaryRoot, "check.ts");
const output = join(temporaryRoot, "dist");
const legacyRuntimePath = join(root, "src/data/v2/index.ts");
const commonRuntimePath = join(root, "src/data/v2/runtimeIndexV2.ts");

const generatedRoot = join(root, "src/data/generated-v2");
const readJson = (relativePath) => JSON.parse(readFileSync(join(generatedRoot, relativePath), "utf8"));
const generatedIndex = readJson("index.json");
if (generatedIndex.schemaVersion !== 2) throw new Error("index généré V2 absent ou invalide");
const expectedModes = {
  "visible-obstacles": [16, "general"],
  "ordinary-norms": [13, "general"],
  "invisible-effects": [16, "general"],
  intersectionalities: [16, "intersectional"],
  discovery: [0, "general"],
};
for (const [modeId, [situationCount, galleryId]] of Object.entries(expectedModes)) {
  const mode = readJson(`modes/${modeId}.json`);
  if (mode.modeId !== modeId || mode.galleryId !== galleryId || mode.situations.length !== situationCount) throw new Error(`banque générée invalide : ${modeId}`);
}

const source = `
import {
  createGameSet,
  createSeededRuntimeRandom,
  getRuntimeCharactersForMode,
  normalizedRuntimeBanksV2,
} from ${JSON.stringify(commonRuntimePath)};
import {
  createVisibleObstaclesGameSet,
  getPlayableCharacterV2,
  getPlayableVisibleObstacleFeedback,
  getPlayableVisibleObstacleSituation,
  getVisibleObstacleMovement,
  movementDecisionToStep,
  visibleObstaclesRuntimeBank,
} from ${JSON.stringify(legacyRuntimePath)};
import type {
  EditorialCharacterIdV2,
  EditorialModeIdV2,
  MovementDecision,
} from ${JSON.stringify(join(root, "src/types/editorialV2.ts"))};
import type {
  NormalizedRuntimeBankV2,
  RuntimeGameSetV2,
  RuntimeModeId,
} from ${JSON.stringify(join(root, "src/types/runtimeV2.ts"))};

const assert = (condition: unknown, message: string): asserts condition => { if (!condition) throw new Error(message); };
const generalIds = ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09"] as const;
const intersectionalIds = ["XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08"] as const;
const modes = ["visible-obstacles", "ordinary-norms", "invisible-effects", "intersectionalities", "discovery"] as const;
const requiredProtections = {
  "visible-obstacles": ["V09", "V10"],
  "ordinary-norms": ["N12", "N13"],
  "invisible-effects": ["I14", "I15"],
  intersectionalities: ["X13", "X14"],
} as const;

function countObstacles(game: RuntimeGameSetV2): number {
  return game.situations.filter(({ proposedDecision }) => proposedDecision === "stay").length;
}

function validateGroups(game: RuntimeGameSetV2, bank: NormalizedRuntimeBankV2): void {
  const selected = new Set(game.situationIds);
  for (const group of bank.rules.requiredGroups) {
    assert(group.situationIds.filter((id) => selected.has(id)).length >= group.minimum, game.modeId + "/" + game.characterId + " groupe requis " + group.id);
  }
  for (const group of bank.rules.limitedGroups) {
    assert(group.situationIds.filter((id) => selected.has(id)).length <= group.maximum, game.modeId + "/" + game.characterId + " groupe limité " + group.id);
  }
  const requirement = bank.rules.characterRequirements[game.characterId];
  if (requirement?.all) assert(requirement.all.every((id) => selected.has(id)), game.modeId + "/" + game.characterId + " exigence all");
  if (requirement?.any) assert(requirement.any.some((id) => selected.has(id)), game.modeId + "/" + game.characterId + " exigence any");
  if (requirement?.atLeast) assert(requirement.atLeast.ids.filter((id) => selected.has(id)).length >= requirement.atLeast.count, game.modeId + "/" + game.characterId + " exigence atLeast");
}

function validateOrder(game: RuntimeGameSetV2): void {
  assert(!game.situations[0].protective, "Découverte : première carte protectrice");
  assert(game.situations.slice(-3).some(({ protective }) => protective), "Découverte : aucune protection dans les trois dernières");
  let previousDecision: MovementDecision | undefined;
  let run = 0;
  for (let index = 0; index < game.situations.length; index += 1) {
    const current = game.situations[index];
    const previous = game.situations[index - 1];
    assert(!previous || previous.originMode !== current.originMode, "Découverte : deux modes consécutifs identiques");
    assert(!previous || !previous.protective || !current.protective, "Découverte : protections consécutives");
    run = current.proposedDecision === previousDecision ? run + 1 : 1;
    assert(run <= 3, "Découverte : plus de trois décisions identiques");
    previousDecision = current.proposedDecision;
  }
}

function validateGame(game: RuntimeGameSetV2): void {
  assert(game.situations.length === 10 && game.situationIds.length === 10, game.modeId + " : dix cartes attendues");
  assert(new Set(game.situationIds).size === 10, game.modeId + " : identifiants dupliqués");
  assert(game.situations.every((situation, index) => situation.id === game.situationIds[index]), game.modeId + " : ordre ids/objets divergent");
  assert(game.situations.every(({ proposedDecision, feedback, image }) => (proposedDecision === "advance" || proposedDecision === "stay") && feedback.decision === proposedDecision && feedback.explanation.length > 0 && image === null), game.modeId + " : décision, feedback ou image invalide");
  if (game.modeId === "discovery") {
    const quotas = { "visible-obstacles": 0, "ordinary-norms": 0, "invisible-effects": 0 };
    for (const situation of game.situations) {
      assert(situation.originMode !== "intersectionalities" && !situation.id.startsWith("X"), "Découverte : carte X interdite");
      quotas[situation.originMode] += 1;
    }
    assert(quotas["visible-obstacles"] === 3 && quotas["ordinary-norms"] === 3 && quotas["invisible-effects"] === 4, "Découverte : quotas invalides");
    const protections = game.situations.filter(({ protective }) => protective);
    assert(protections.length === 2 && new Set(protections.map(({ originMode }) => originMode)).size === 2, "Découverte : protections invalides");
    for (const originMode of Object.keys(quotas) as Array<keyof typeof quotas>) assert(game.situations.some((item) => item.originMode === originMode && item.proposedDecision === "stay"), "Découverte : famille sans obstacle " + originMode);
    assert(countObstacles(game) >= 3 && countObstacles(game) <= 7, "Découverte : obstacles hors limites");
    if (game.characterId === "P04") assert(game.situationIds.includes("I16"), "Découverte/Arthur : I16 absente");
    if (game.characterId === "P02" || game.characterId === "P06") assert(game.situationIds.includes("I12") || game.situationIds.includes("I13"), "Découverte : I12/I13 absente");
    if (game.characterId === "P07") assert(game.situationIds.includes("I13"), "Découverte/Camille : I13 absente");
    assert(["V05", "V13", "V14", "V15"].filter((id) => game.situationIds.includes(id as never)).length <= 1, "Découverte : maximum V dépassé");
    assert(["N04", "N05", "N11"].filter((id) => game.situationIds.includes(id as never)).length <= 1, "Découverte : maximum N dépassé");
    assert(game.situationIds.some((id) => /^I0[1-5]$/.test(id)), "Découverte : premier groupe I absent");
    assert(game.situationIds.some((id) => /^(I0[6-9]|I10|I11|I16)$/.test(id)), "Découverte : second groupe I absent");
    validateOrder(game);
    return;
  }
  const bank = normalizedRuntimeBanksV2[game.modeId];
  const mandatory = requiredProtections[game.modeId];
  assert(mandatory.every((id) => game.situationIds.includes(id)), game.modeId + " : protection obligatoire absente");
  assert(game.situations.filter(({ protective }) => protective).length === 2, game.modeId + " : deux protections attendues");
  const variables = game.situations.filter(({ protective }) => !protective);
  const obstacleCount = variables.filter(({ proposedDecision }) => proposedDecision === "stay").length;
  assert(obstacleCount >= bank.rules.variableObstacleRangePerCharacter.minimum && obstacleCount <= bank.rules.variableObstacleRangePerCharacter.maximum, game.modeId + " : obstacles variables hors limites");
  validateGroups(game, bank);
}

const expectedNames = { P01: "Noé", P02: "Jade", P03: "Sam", P07: "Camille", P08: "Lou", P09: "Inès" } as const;
for (const [id, name] of Object.entries(expectedNames)) assert(getPlayableCharacterV2(id as keyof typeof expectedNames).name === name, id + " doit correspondre à " + name);
assert(visibleObstaclesRuntimeBank.characters.length === 9, "neuf personnages visibles attendus");
assert(new Set(visibleObstaclesRuntimeBank.characters.map(({ accentColor }) => accentColor.toLowerCase())).size === 9, "neuf couleurs distinctes attendues");
assert(getPlayableVisibleObstacleSituation("V01").id === "V01" && getPlayableVisibleObstacleSituation("V16").id === "V16", "bornes V absentes");
assert(getVisibleObstacleMovement("V01", "P01") === "stay" && getVisibleObstacleMovement("V01", "P07") === "advance", "matrice visible modifiée");
assert(getPlayableVisibleObstacleFeedback("V12", "P04").decision === "stay", "feedback visible modifié");
assert(movementDecisionToStep("advance") === 1 && movementDecisionToStep("stay") === 0, "conversion de mouvement invalide");
for (const seed of [0, 1, 7, 42, 2026]) {
  const legacy = createVisibleObstaclesGameSet(createSeededRuntimeRandom(seed));
  assert(legacy.situationIds.length === 10 && legacy.situationIds.includes("V09") && legacy.situationIds.includes("V10"), "runtime visible historique invalide");
}

for (const modeId of modes) {
  const ids = modeId === "intersectionalities" ? intersectionalIds : generalIds;
  const gallery = getRuntimeCharactersForMode(modeId);
  assert(gallery.length === ids.length && gallery.every(({ id }, index) => id === ids[index]), modeId + " : mauvaise galerie");
  for (const characterId of ids) {
    for (const seed of [0, 1, 2, 7, 17, 42, 99, 2026, 65535, 4294967295]) {
      validateGame(createGameSet({ modeId, characterId, random: createSeededRuntimeRandom(seed) }));
    }
    const first = createGameSet({ modeId, characterId, random: createSeededRuntimeRandom(123456) });
    const second = createGameSet({ modeId, characterId, random: createSeededRuntimeRandom(123456) });
    assert(JSON.stringify(first.situationIds) === JSON.stringify(second.situationIds), modeId + "/" + characterId + " : tirage non reproductible");
  }
}

let rejectedWrongGallery = false;
try { createGameSet({ modeId: "intersectionalities", characterId: "P02", random: () => 0.5 }); } catch { rejectedWrongGallery = true; }
assert(rejectedWrongGallery, "personnage de la galerie générale accepté en Intersectionnalités");
let rejectedHomonym = false;
try { createGameSet({ modeId: "ordinary-norms", characterId: "XP05", random: () => 0.5 }); } catch { rejectedHomonym = true; }
assert(rejectedHomonym, "homonyme intersectionnel accepté par prénom ou mauvais identifiant");
let rejectedMode = false;
try { createGameSet({ modeId: "unknown-mode" as RuntimeModeId, characterId: "P01", random: () => 0.5 }); } catch { rejectedMode = true; }
assert(rejectedMode, "mode inconnu accepté");

for (const modeId of modes) {
  const characterId = modeId === "intersectionalities" ? "XP01" : "P01";
  for (const invalid of [-0.1, 1, 1.2, Number.NaN, Number.POSITIVE_INFINITY]) {
    let rejected = false;
    try { createGameSet({ modeId, characterId, random: () => invalid }); } catch { rejected = true; }
    assert(rejected, modeId + " : valeur aléatoire invalide acceptée " + String(invalid));
  }
}

console.log("Vérification runtime V2 réussie");
console.log("Modes contrôlés : " + modes.join(", "));
console.log("Parties générées et validées : 440 + contrôles de reproductibilité");
console.log("Deux galeries strictement séparées par identifiant : oui");
console.log("Découverte : quotas, protections, obstacles, contraintes et ordre conformes");
console.log("Obstacles visibles historique : API et résultats de référence préservés");
console.log("Valeurs aléatoires invalides rejetées pour les cinq modes");
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
