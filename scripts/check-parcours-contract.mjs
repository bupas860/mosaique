import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "src/data/parcours/lgbti.manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const fail = (message) => { throw new Error(`Contrat parcours invalide : ${message}`); };
const readJson = async (relative) => JSON.parse(await readFile(path.join(root, relative), "utf8"));
const exists = async (relative) => { try { await access(path.join(root, relative)); return true; } catch { return false; } };

if (manifest.schemaVersion !== 1) fail("schemaVersion doit valoir 1");
if (manifest.id !== "lgbti" || manifest.slug !== "lgbti") fail("le manifeste de référence doit identifier le parcours lgbti");
if (manifest.status !== "active") fail("le parcours LGBTI+ de référence doit être actif");
if (!manifest.publicLabel || !manifest.title || !manifest.description) fail("identité publique incomplète");

const modes = manifest.modes?.available ?? [];
if (new Set(modes).size !== modes.length) fail("modes dupliqués");
if (!modes.includes(manifest.modes?.default)) fail("mode par défaut absent des modes disponibles");

const declaredPaths = [
  manifest.content.characters.path,
  manifest.content.characters.portraitsRoot,
  manifest.content.situations.path,
  manifest.content.situations.illustrationsRoot,
  manifest.content.references.reperesPath,
  manifest.content.references.usefulWordsPath,
  manifest.content.references.journeyWordsPath,
  manifest.content.quizzes.charactersPath,
  manifest.content.quizzes.situationsPath,
  manifest.licensing.contentLicenseFile,
  manifest.licensing.aiNoticeFile,
];
for (const relative of declaredPaths) if (!(await exists(relative))) fail(`chemin déclaré introuvable : ${relative}`);

const characters = await readJson(manifest.content.characters.path);
if (characters.biographies?.length !== manifest.content.characters.count) fail("cardinalité des personnages");
const galleries = characters.biographies.reduce((counts, character) => {
  counts[character.gallery] = (counts[character.gallery] ?? 0) + 1;
  return counts;
}, {});
for (const [gallery, expected] of Object.entries(manifest.content.characters.galleries)) {
  if (galleries[gallery] !== expected) fail(`galerie ${gallery} : ${galleries[gallery] ?? 0} au lieu de ${expected}`);
}

const reperes = await readJson(manifest.content.references.reperesPath);
if (reperes.reperes?.length !== manifest.content.references.reperesCount) fail("cardinalité des Repères");

const words = await readJson(manifest.content.references.usefulWordsPath);
if (words.words?.length !== manifest.content.references.usefulWordsCount) fail("cardinalité des Mots utiles");
if (words.words.filter((word) => word.isJourneyWord).length !== manifest.content.references.journeyWordsCount) fail("cardinalité des Mots et parcours");

for (const [pathKey, countKey] of [["charactersPath", "charactersQuestions"], ["situationsPath", "situationsQuestions"]]) {
  const quiz = await readJson(manifest.content.quizzes[pathKey]);
  if (quiz.quiz?.questions?.length !== manifest.content.quizzes[countKey]) fail(`cardinalité du quiz ${pathKey}`);
}

const situationsSource = await readFile(path.join(root, manifest.content.situations.path), "utf8");
const marker = "export const publicSituations = [";
const start = situationsSource.indexOf(marker);
if (start < 0) fail("tableau publicSituations introuvable");
const tail = situationsSource.slice(start + marker.length);
const end = tail.indexOf("] as const satisfies readonly PublicSituation[];");
if (end < 0) fail("fin du tableau publicSituations introuvable");
const situationsBlock = tail.slice(0, end);
const codes = [...situationsBlock.matchAll(/"code": "([VNIX]\\d{2})"/g)].map((match) => match[1]);
const roles = [...situationsBlock.matchAll(/"role": "(obstacle|protection)"/g)].map((match) => match[1]);
if (codes.length !== manifest.content.situations.count) fail(`situations : ${codes.length} au lieu de ${manifest.content.situations.count}`);
if (new Set(codes).size !== codes.length) fail("codes Situation dupliqués");
for (const [prefix, expected] of Object.entries(manifest.content.situations.focals)) {
  const actual = codes.filter((code) => code.startsWith(prefix)).length;
  if (actual !== expected) fail(`focale ${prefix} : ${actual} au lieu de ${expected}`);
}
for (const [role, expected] of Object.entries(manifest.content.situations.roles)) {
  const actual = roles.filter((value) => value === role).length;
  if (actual !== expected) fail(`rôle ${role} : ${actual} au lieu de ${expected}`);
}

console.log(`Contrat parcours contrôlé : ${manifest.publicLabel}, ${characters.biographies.length} personnages, ${codes.length} situations, ${reperes.reperes.length} Repères, ${words.words.length} Mots utiles.`);
