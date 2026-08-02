import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (filename) => readFile(path.join(root, filename), "utf8");
const requireText = (content, expected, label) => {
  if (!content.includes(expected)) throw new Error(`${label} absent : ${expected}`);
};

export function assertPortraitContract(content, reference) {
  const publicPortraitImport = 'import { getCharacterPortraitAltV2 } from "../data/public/characterPortraitAltsV2";';
  if (!content.includes(publicPortraitImport)) throw new Error("Contrat du portrait : source publique des alternatives absente");
  if (content !== reference) throw new Error("Contrat visible du portrait modifié par rapport à la référence 8D validée");
}

const unchangedVisibleFiles = [
  "src/pages/ModeSelectionPage.tsx",
  "src/pages/CharacterSelectionPage.tsx",
  "src/pages/GamePage.tsx",
  "src/pages/FinalSummaryPage.tsx",
  "src/components/SituationCard.tsx",
  "src/data/v2/situationIllustrationsV2.ts",
];
for (const filename of unchangedVisibleFiles) {
  const current = await read(filename);
  const reference = execFileSync("git", ["show", `HEAD:${filename}`], { cwd: root, encoding: "utf8" });
  if (current !== reference) throw new Error(`Contrat visible modifié hors périmètre : ${filename}`);
}

const portrait = await read("src/components/CharacterPortrait.tsx");
const portraitReference = execFileSync("git", ["show", "c63354c:src/components/CharacterPortrait.tsx"], { cwd: root, encoding: "utf8" });
assertPortraitContract(portrait, portraitReference);

const app = await read("src/App.tsx");
for (const expected of [
  'lazy(() => import("./game/GameApp"))',
  'lazy(() => import("./features/situations/SituationsApp"))',
  'lazy(() => import("./features/characters/CharactersApp"))',
  'route.kind === "explorer-characters"',
  'route.kind === "character-biography"',
  'route.kind === "situations"',
  'route.kind === "reperes"',
  "return <NotFoundPage />",
  "Chargement du jeu…",
  'aria-busy="true"',
  'aria-live="polite"',
]) requireText(app, expected, "Contrat du socle");

const game = await read("src/game/GameApp.tsx");
for (const expected of [
  'type Screen = "home" | "mode-selection" | "character-selection" | "game"',
  "createActiveGameSet",
  "getActiveCharactersForMode",
  "setScreen(\"character-selection\")",
  "setScreen(\"game\")",
  "<FinalSummaryPage",
  "<HomePage",
]) requireText(`${game}\n${await read("src/pages/GamePage.tsx")}`, expected, "Parcours Jouer");

const routes = await read("src/utils/appRoute.ts");
for (const expected of [
  'GAME_HASH = "#/jouer"',
  'PERSONNAGES_HASH = "#/personnages"',
  'LEGACY_EXPLORER_CHARACTERS_HASH = "#/explorer/personnages"',
  'UNDERSTAND_HASH = "#/comprendre"',
  'kind: "redirect"',
  'window.addEventListener("hashchange"',
  'kind: "not-found"',
]) requireText(routes, expected, "Route historique");

const charactersGallery = await read("src/pages/ExplorerCharactersPage.tsx");
const characterBiography = await read("src/pages/CharacterBiographyPage.tsx");
const publicBiographiesFacade = await read("src/data/v2/publicBiographiesV2.ts");
for (const expected of [
  'import biographiesJson from "../public/publicCharacters.generated.json"',
  "expectedIds", "catalogue incomplet ou mal ordonné", "publicBiographiesV2ById",
]) requireText(publicBiographiesFacade, expected, "Façade publique Personnages 8D");
for (const forbidden of ["matrix", "feedback", "decision", "game-config", "mosaic-data"]) {
  if (publicBiographiesFacade.includes(forbidden)) throw new Error(`Dépendance opératoire dans la façade publique : ${forbidden}`);
}
for (const expected of ["publicBiographiesV2", "CharacterPortrait", "CharacterPublicTags", "biography.shortDescription", "Découvrir son parcours", "Mots et parcours"]) requireText(charactersGallery, expected, "Contrat galerie Personnages 8D");
for (const expected of [
  "BiographyAccordion", "biography.sections", "Mots et parcours", "Personnage précédent", "Personnage suivant", "Retour aux personnages",
  "publicBiographiesV2.findIndex", "overview: true", "journey: false", "privacy: false", "school: false",
  "À propos de cette fiche", "Les personnes informées varient selon les espaces.",
]) requireText(characterBiography, expected, "Contrat biographie Personnages 8D");

const reperesApp = await read("src/features/reperes/ReperesApp.tsx");
const usefulWordsApp = await read("src/features/useful-words/UsefulWordsApp.tsx");
const situationWordLinks = await read("src/features/situations/UsefulWordList.tsx");
const journeyWords = await read("src/features/characters/JourneyWordsPage.tsx");
for (const expected of ["reperes.map", "Lire ce repère", "Repère précédent", "Repère suivant", "Retour aux Repères", "Mots utiles"]) requireText(reperesApp, expected, "Contrat Repères 8E");
for (const expected of ["words.slice(0, 15)", "words.slice(15)", "contextReturn", "Retour aux mots utiles", "Les mots utiles — Mosaïque"]) requireText(usefulWordsApp, expected, "Contrat Mots utiles 8E");
requireText(situationWordLinks, "?from=situation-", "183 retours contextuels Situations");
requireText(journeyWords, "<a href={word.target}", "15 liens Mots et parcours");
const frame = await read("src/components/public/PublicFrame.tsx");
if (frame.includes('{ label: "Mots utiles"')) throw new Error("Mots utiles devient une cinquième entrée principale");

const characterQuiz = JSON.parse(await read("src/data/public/publicCharacterQuiz.generated.json")).quiz;
const situationQuiz = JSON.parse(await read("src/data/public/publicSituationQuiz.generated.json")).quiz;
if (characterQuiz.questions.length !== 8 || characterQuiz.questions.map(({ id }) => id).join() !== "QP01,QP02,QP03,QP04,QP05,QP06,QP07,QP08") throw new Error("Contrat Quiz Personnages invalide");
if (situationQuiz.questions.map(({ code }) => code).join() !== "N02,V10,X01,I01,N13,X13,V01,I14") throw new Error("Contrat ordre Quiz Situations invalide");
const characterQuizApp = await read("src/features/quiz/CharacterQuizApp.tsx");
const situationQuizApp = await read("src/features/quiz/SituationQuizApp.tsx");
for (const expected of ["Valider ma réponse", "Question suivante", "repères retrouvés sur 8", "Recommencer le quiz"]) requireText(characterQuizApp, expected, "Contrat Quiz Personnages 8F");
for (const expected of ["Situation {index + 1} sur 8", "Valider mes deux réponses", "focales retrouvées sur 8", "rôles obstacle ou protection retrouvés sur 8", "Recommencer exactement la même série"]) requireText(situationQuizApp, expected, "Contrat Quiz Situations 8F");
for (const forbidden of ["sur 16", "pourcentage", "score global", "note sur 20", "data-code", "data-focal", "data-role"]) if (situationQuizApp.includes(forbidden)) throw new Error(`Fuite ou score interdit dans Quiz Situations : ${forbidden}`);
if (!situationQuizApp.includes('phase === "feedback" ? `${question.code} — ${question.title}` : "Quiz Situations"')) throw new Error("Masquage préalable du titre Situation non contrôlé");

console.log(`Contrats visibles Jouer inchangés : ${unchangedVisibleFiles.length} fichiers comparés au commit HEAD.`);
console.log("Parcours Jouer, chargement accessible, médias, routes et contrats Personnages 8D : contrôlés.");
