import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (filename) => readFile(path.join(root, filename), "utf8");
const requireText = (content, expected, label) => {
  if (!content.includes(expected)) throw new Error(`${label} absent : ${expected}`);
};

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
const portraitReference = execFileSync("git", ["show", "HEAD:src/components/CharacterPortrait.tsx"], { cwd: root, encoding: "utf8" });
const previousPortraitImport = 'import { getCharacterPortraitAltV2 } from "../data/v2/publicBiographiesV2";';
const publicPortraitImport = 'import { getCharacterPortraitAltV2 } from "../data/public/characterPortraitAltsV2";';
if (portrait.replace(publicPortraitImport, previousPortraitImport) !== portraitReference) throw new Error("Contrat visible du portrait modifié au-delà de sa source d’alternative");

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

console.log(`Contrats visibles Jouer inchangés : ${unchangedVisibleFiles.length} fichiers comparés au commit HEAD.`);
console.log("Parcours Jouer, chargement accessible, médias, routes et contrats Personnages 8D : contrôlés.");
