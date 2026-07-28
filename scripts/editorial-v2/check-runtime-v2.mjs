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
const activeRuntimePath = join(root, "src/data/v2/activeModesRuntimeV2.ts");
const gameModesPath = join(root, "src/data/gameModes.ts");
const personalizePath = join(root, "src/utils/personalizePlayerText.ts");

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
import {
  createActiveGameSet,
  getActiveCharacter,
  getActiveCharactersForMode,
} from ${JSON.stringify(activeRuntimePath)};
import { gameModes } from ${JSON.stringify(gameModesPath)};
import { personalizePlayerText } from ${JSON.stringify(personalizePath)};
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

const availableModes = gameModes.filter(({ available }) => available).map(({ id }) => id);
assert(JSON.stringify(availableModes) === JSON.stringify(["visible-obstacles", "ordinary-norms", "invisible-effects", "intersectionalities"]), "modes disponibles dans l’interface invalides");
assert(gameModes.find(({ id }) => id === "ordinary-norms")?.description === "Repérez comment des procédures, des catégories ou des organisations habituelles peuvent créer des obstacles sans intention explicite de discriminer.", "description Normes ordinaires invalide");
assert(gameModes.find(({ id }) => id === "invisible-effects")?.description === "Repérez les effets moins visibles de l’invisibilisation, des représentations limitées, de l’anticipation et de l’autocensure.", "description Effets invisibles invalide");
assert(gameModes.find(({ id }) => id === "intersectionalities")?.description === "Repérez comment plusieurs rapports sociaux se combinent et produisent des obstacles spécifiques, qui ne se réduisent pas à une simple addition.", "description Intersectionnalités invalide");
assert(gameModes.find(({ id }) => id === "discovery")?.available === false, "Découverte a été activé");
for (const modeId of ["visible-obstacles", "ordinary-norms", "invisible-effects"] as const) {
  const gallery = getActiveCharactersForMode(modeId);
  assert(gallery.length === 9 && gallery.every(({ id }) => id.startsWith("P")), modeId + " : galerie générale active invalide");
  assert(JSON.stringify(gallery.map(({ id }) => id)) === JSON.stringify(["P04", "P05", "P09", "P02", "P06", "P07", "P08", "P01", "P03"]), modeId + " : ordre de galerie générale modifié");
}
const activeIntersectionalCharacters = getActiveCharactersForMode("intersectionalities");
assert(activeIntersectionalCharacters.length === 8, "parcours actif Intersectionnalités : huit personnages attendus");
assert(JSON.stringify(activeIntersectionalCharacters.map(({ id }) => id)) === JSON.stringify(intersectionalIds), "parcours actif Intersectionnalités : ordre XP invalide");
assert(activeIntersectionalCharacters.every(({ id, image }) => id.startsWith("XP") && image === null), "parcours actif Intersectionnalités : identifiant ou remplacement visuel invalide");
assert(new Set(activeIntersectionalCharacters.map(({ accentColor }) => accentColor)).size === 8, "parcours actif Intersectionnalités : accents non distincts");
assert(getActiveCharacter("intersectionalities", "XP04").pronouns.join(",") === "iel", "Charlie doit conserver le pronom iel");
for (const characterId of generalIds) {
  for (const modeId of ["visible-obstacles", "ordinary-norms", "invisible-effects"] as const) {
    for (const seed of [0, 7, 42, 2026, 20260728]) {
      const random = createSeededRuntimeRandom(seed);
      const first = createActiveGameSet(modeId, characterId, random);
      const replay = createActiveGameSet(modeId, characterId, random);
      validateGame(first);
      validateGame(replay);
      if (modeId === "ordinary-norms") {
        assert(first.situationIds.every((id) => id.startsWith("N")), "parcours actif Normes ordinaires : préfixe étranger");
        assert(first.situationIds.includes("N12") && first.situationIds.includes("N13"), "parcours actif Normes ordinaires : protections absentes");
      }
      if (modeId === "invisible-effects") {
        assert(first.situationIds.every((id) => id.startsWith("I")), "parcours actif Effets invisibles : préfixe étranger");
        assert(first.situationIds.includes("I14") && first.situationIds.includes("I15"), "parcours actif Effets invisibles : protections absentes");
        if (characterId === "P04") assert(first.situationIds.includes("I16"), "parcours actif Effets invisibles/Arthur : I16 absente");
      }
      const characterName = getPlayableCharacterV2(characterId).name;
      for (const situation of first.situations) {
        const displayed = [
          situation.title,
          situation.text,
          situation.question,
          situation.feedback.explanation,
          situation.mechanism,
          situation.interpretation ?? "",
          situation.vigilance ?? "",
          situation.intersectionalTest ?? "",
        ].map((text) => personalizePlayerText(text, characterName));
        assert(displayed.every((text) => !text.includes("[Prénom]")), modeId + "/" + situation.id + " : marqueur prénom encore affiché");
      }
    }
  }
}

for (const characterId of intersectionalIds) {
  for (const seed of [0, 7, 42, 2026, 20260728]) {
    const random = createSeededRuntimeRandom(seed);
    const first = createActiveGameSet("intersectionalities", characterId, random);
    const replay = createActiveGameSet("intersectionalities", characterId, random);
    const reference = createGameSet({
      modeId: "intersectionalities",
      characterId,
      random: createSeededRuntimeRandom(seed),
    });
    validateGame(first);
    validateGame(replay);
    assert(JSON.stringify(first.situationIds) === JSON.stringify(reference.situationIds), "parcours actif Intersectionnalités : tirage divergent du moteur commun");
    assert(first.situations.every((situation, index) => situation.feedback.explanation === reference.situations[index].feedback.explanation), "parcours actif Intersectionnalités : feedback divergent du moteur commun");
    assert(first.galleryId === "intersectional", "parcours actif Intersectionnalités : mauvaise galerie");
    assert(first.situationIds.every((id) => id.startsWith("X")), "parcours actif Intersectionnalités : préfixe étranger");
    assert(first.situationIds.includes("X13") && first.situationIds.includes("X14"), "parcours actif Intersectionnalités : protections absentes");
    assert(first.situations.every(({ intersectionalTest }) => Boolean(intersectionalTest)), "parcours actif Intersectionnalités : test intersectionnel absent");
    assert(first.situations.every(({ movements }) => intersectionalIds.every((id) => movements[id]) && generalIds.every((id) => !movements[id])), "parcours actif Intersectionnalités : matrice de galerie invalide");
    const character = getActiveCharacter("intersectionalities", characterId);
    for (const situation of first.situations) {
      const displayed = [
        situation.title,
        situation.text,
        situation.question,
        situation.feedback.explanation,
        situation.mechanism,
        situation.interpretation ?? "",
        situation.intersectionalTest ?? "",
      ].map((text) => personalizePlayerText(text, character.name));
      assert(displayed.every((text) => !text.includes("[Prénom]")), "intersectionalities/" + situation.id + " : marqueur prénom encore affiché");
    }
  }
}

const homonyms = [
  ["XP05", "P02"],
  ["XP06", "P05"],
  ["XP07", "P08"],
  ["XP08", "P01"],
] as const;
for (const [intersectionalId, generalId] of homonyms) {
  const intersectionalCharacter = getActiveCharacter("intersectionalities", intersectionalId);
  const generalCharacter = getActiveCharacter("visible-obstacles", generalId);
  assert(intersectionalCharacter.id !== generalCharacter.id, intersectionalId + " fusionné avec " + generalId);
  assert("profile" in intersectionalCharacter && !("profile" in generalCharacter), intersectionalId + " a reçu le profil général de " + generalId);
  const game = createActiveGameSet("intersectionalities", intersectionalId, createSeededRuntimeRandom(42));
  assert(game.characterId === intersectionalId && game.situations.every(({ feedback, proposedDecision }) => feedback.decision === proposedDecision), intersectionalId + " : feedback d’un homonyme général");
}

let activeRejectedGeneral = false;
try { createActiveGameSet("intersectionalities", "P02", () => 0.5); } catch { activeRejectedGeneral = true; }
assert(activeRejectedGeneral, "adaptateur actif : personnage P accepté en Intersectionnalités");
let activeRejectedIntersectional = false;
try { createActiveGameSet("ordinary-norms", "XP05", () => 0.5); } catch { activeRejectedIntersectional = true; }
assert(activeRejectedIntersectional, "adaptateur actif : personnage XP accepté en mode général");

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
console.log("Parcours actif : 4 modes, galeries P/XP séparées, personnalisation complète et rejeu valides");
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
