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
  "src/pages/HomePage.tsx",
  "src/pages/ModeSelectionPage.tsx",
  "src/pages/CharacterSelectionPage.tsx",
  "src/pages/GamePage.tsx",
  "src/pages/FinalSummaryPage.tsx",
  "src/pages/ExplorerCharactersPage.tsx",
  "src/pages/CharacterBiographyPage.tsx",
  "src/utils/appRoute.ts",
  "src/index.css",
];
for (const filename of unchangedVisibleFiles) {
  const current = await read(filename);
  const reference = execFileSync("git", ["show", `HEAD:${filename}`], { cwd: root, encoding: "utf8" });
  if (current !== reference) throw new Error(`Contrat visible modifié hors périmètre : ${filename}`);
}

const app = await read("src/App.tsx");
for (const expected of [
  'lazy(() => import("./game/GameApp"))',
  'route.kind === "explorer-characters"',
  'route.kind === "character-biography"',
  'route.kind === "understand-home"',
  'route.kind === "not-found"',
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
  'EXPLORER_CHARACTERS_HASH = "#/explorer/personnages"',
  'UNDERSTAND_HASH = "#/comprendre"',
  'window.addEventListener("hashchange"',
  'kind: "not-found"',
]) requireText(routes, expected, "Route historique");

console.log(`Contrats visibles inchangés : ${unchangedVisibleFiles.length} fichiers comparés au commit HEAD.`);
console.log("Parcours Jouer, chargement accessible et routes par fragments : contrôlés.");
