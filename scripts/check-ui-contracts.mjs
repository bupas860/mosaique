import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (filename) => readFile(path.join(root, filename), "utf8");
const requireText = (content, expected, label) => {
  if (!content.includes(expected)) throw new Error(`${label} absent : ${expected}`);
};
const sha256 = (content) => createHash("sha256").update(content).digest("hex");
const portraitReferenceHash = "356c621828b60d9481dfca932bae4175229c5d10466f42a506d06bc61df3197f";

export function assertPortraitContract(content, reference) {
  const publicPortraitImport = 'import { getCharacterPortraitAltV2 } from "../data/public/characterPortraitAltsV2";';
  if (!content.includes(publicPortraitImport)) throw new Error("Contrat du portrait : source publique des alternatives absente");
  const referenceHash = reference ? (/^[a-f0-9]{64}$/.test(reference) ? reference : sha256(reference)) : portraitReferenceHash;
  if (sha256(content) !== referenceHash) throw new Error("Contrat visible du portrait modifié par rapport à la référence 8D validée");
}

const unchangedVisibleFiles = new Map([
  ["src/pages/ModeSelectionPage.tsx", "ffceab18e25f63aab32bc25e2402cf7d607014c2b280cfd8a2f993a8cc3ea605"],
  ["src/pages/CharacterSelectionPage.tsx", "bffd82856254e10a14201ce4a528f51d6576c670237f79ebbff6240fb4baf695"],
  ["src/pages/GamePage.tsx", "943f6ce1ab2ac28c7a6492dbe58402f5cad409e5947f8013b97aef5a65696603"],
  ["src/pages/FinalSummaryPage.tsx", "c95732798cd2624137e6d856627ff36f3658155e141cb8f71c051d6d8dd95579"],
  ["src/components/SituationCard.tsx", "f9b20c8a0012fbb96a7ea980b64af97c789f6bc914bf04bc51f87e19e189d961"],
  ["src/data/v2/situationIllustrationsV2.ts", "148d9343fc93db017f54b79c8bb307179d2ca8207c185ffab08f989bc401644a"],
]);
for (const [filename, referenceHash] of unchangedVisibleFiles) {
  const current = await read(filename);
  if (sha256(current) !== referenceHash) throw new Error(`Contrat visible modifié hors périmètre : ${filename}`);
}

const portrait = await read("src/components/CharacterPortrait.tsx");
assertPortraitContract(portrait);

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

console.log(`Contrats visibles Jouer inchangés : ${unchangedVisibleFiles.size} fichiers comparés aux références validées.`);
console.log("Parcours Jouer, chargement accessible, médias, routes et contrats Personnages 8D : contrôlés.");
