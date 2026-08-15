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
const preparation = await read("src/pages/GamePreparationPage.tsx");
const gamePage = await read("src/pages/GamePage.tsx");
const gameSession = await read("src/game/gameSession.ts");
const quitDialog = await read("src/components/QuitGameDialog.tsx");
const situationCard = await read("src/components/SituationCard.tsx");
const summary = await read("src/pages/FinalSummaryPage.tsx");
for (const expected of [
  'type Screen = "preparation" | "game"',
  "createActiveGameSet",
  "getActiveCharactersForMode",
  "setScreen(\"preparation\")",
  "setScreen(\"game\")",
  "loadGameSession", "clearActiveGame", "saveGamePreparation", "<GamePreparationPage",
  "<GamePage",
]) requireText(game, expected, "Parcours Jouer");
for (const expected of ['version: 1', 'sessionStorage.getItem(STORAGE_KEY)', 'sessionStorage.setItem(STORAGE_KEY', 'situationIds.length !== 10', 'new Set(situationIds).size !== 10', 'saveActiveGame', 'clearActiveGame']) requireText(gameSession, expected, "Session Jouer");
for (const expected of [
  "Préparer votre partie", "1. Choisissez un mode", "2. Choisissez votre personnage",
  "Recommandé pour découvrir la marche des privilèges", "Commencer la partie", "Personnage sélectionné",
  "selectedSummary.shortDescription", "Découvrir son parcours",
]) requireText(preparation, expected, "Préparation Jouer 8G");
if (preparation.includes(">Disponible<")) throw new Error("Badge Disponible inutile dans la préparation Jouer");
for (const expected of [
  "cette situation constitue-t-elle un obstacle", 'onDecision("stay")', 'onDecision("advance")',
  "Comprendre ce que signifie avancer ou rester sur place",
  "Avancer signifie que cette situation ne réduit pas la marge de manœuvre du personnage. Rester sur place signifie qu’elle constitue ici un obstacle.",
  'event.key === "Escape"', "aria-expanded={helpOpen}", "hidden={!helpOpen}",
]) requireText(situationCard, expected, "Question Jouer 8G");
for (const expected of [
  "Retour sur votre réponse", "Situation suivante", "Voir le bilan", "Comprendre cette situation",
  "aria-expanded={detailsOpen}", "hidden={!detailsOpen}", "<strong>Focale :</strong>", "Quitter la partie", "saveActiveGame",
]) requireText(gamePage, expected, "Feedback Jouer 8G");
for (const expected of ['role="dialog"', 'aria-modal="true"', 'Quitter cette partie', 'Votre progression dans cette partie sera perdue.', 'Continuer la partie', 'event.key === "Escape"', 'cancelRef.current?.focus()']) requireText(quitDialog, expected, "Dialogue Quitter Jouer");
for (const expected of [
  "Votre parcours dans les 10 situations", "Votre bilan", "Lecture par focale",
  "Cet indicateur n’est pas une note.", "Situation {selectedStep + 1}",
  "Récapitulatif de vos réponses", "aria-expanded={open}", "hidden={!open}",
  "Rejouer", "Changer de personnage", "backHomeLabel",
]) requireText(summary, expected, "Bilan Jouer 8G");
for (const forbidden of ["Revoir mes réponses", "Lecture par famille", "correct", "incorrect"]) if (summary.includes(forbidden)) throw new Error(`Vocabulaire ou action obsolète dans le bilan : ${forbidden}`);

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
  "biography.sections", "Mots et parcours", "Personnage précédent", "Personnage suivant", "Retour aux personnages",
  "publicBiographiesV2.findIndex", 'useState<(typeof groups)[number]["id"]>("overview")',
  'role="tablist"', 'role="tab"', 'role="tabpanel"', "aria-selected={selected}", "aria-expanded={open}", 'role="region"', "hidden={!open}", "Les personnes informées varient selon les espaces.",
]) requireText(characterBiography, expected, "Contrat biographie Personnages 8D");
for (const forbidden of ["BiographyAccordion", "À propos de cette fiche", "Sommaire de la fiche", "biography.galleryLabel"]) if (characterBiography.includes(forbidden)) throw new Error(`Présentation technique ou obsolète dans la fiche Personnage : ${forbidden}`);

const reperesApp = await read("src/features/reperes/ReperesApp.tsx");
const usefulWordsApp = await read("src/features/useful-words/UsefulWordsApp.tsx");
const situationWordLinks = await read("src/features/situations/UsefulWordList.tsx");
const journeyWords = await read("src/features/characters/JourneyWordsPage.tsx");
for (const expected of ["reperes.map", "reference-accordions", "Repère précédent", "Repère suivant", "Approfondir", "Sources", "Mots utiles", "aria-expanded={open}"]) requireText(reperesApp, expected, "Contrat Repères 8G");
for (const expected of ["words.slice(0, 15)", "words.slice(15)", "contextReturn", "Retour aux mots utiles", '<h2>Sources</h2>', "word.publicSources.length > 0", 'publicDocumentTitle("Les mots utiles"']) requireText(usefulWordsApp, expected, "Contrat Mots utiles 8E");
for (const expected of ['className="context-return app-text-link"', '<a className="app-text-link" href="#/mots-utiles">Voir les 25 mots utiles</a>']) requireText(usefulWordsApp, expected, "Navigation visible Mots utiles");
for (const forbidden of ['className="reference-id"', "Espaces d’utilisation", "Contenu daté", "Sources publiques"]) if (usefulWordsApp.includes(forbidden)) throw new Error(`Métadonnée technique visible dans Mots utiles : ${forbidden}`);
requireText(situationWordLinks, "?from=situation-", "183 retours contextuels Situations");
for (const expected of ['className="journey-word-card"', "href={word.target}", "Orientations et attirances", "Genre et caractéristiques sexuées", "Parcours et confidentialité", "classifiedIds", "unclassified"]) requireText(journeyWords, expected, "Contrat Mots et parcours");
if (journeyWords.includes("journey-word-id") || journeyWords.includes("word.inBrief")) throw new Error("Contenu technique ou définition affiché sur les cartes Mots et parcours");
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
if (!situationQuizApp.includes('phase === "feedback" ? publicDocumentTitle("Quiz Situations", question.code, question.title) : publicDocumentTitle("Quiz Situations")')) throw new Error("Masquage préalable du titre de document Situation non contrôlé");

console.log(`Contrat média Jouer inchangé : ${unchangedVisibleFiles.size} fichier comparé à la référence validée.`);
console.log("Parcours Jouer 8G, moteur appelé sans duplication, chargement accessible, routes et contrats Personnages : contrôlés.");
