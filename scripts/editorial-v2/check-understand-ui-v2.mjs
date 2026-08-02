import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (filename) => readFile(path.join(root, filename), "utf8");
const requireText = (content, text, label) => { if (!content.includes(text)) throw new Error(`${label} absent : ${text}`); };

const routes = await read("src/utils/appRoute.ts");
for (const text of ["#/comprendre", "parcours\\/", "modules\\/", "glossaire", "bibliographie", 'target: REPERES_HASH']) requireText(routes, text, "Redirection historique Comprendre");
const app = await read("src/App.tsx");
if (app.includes('import("./pages/understand/') || app.includes("UnderstandAsyncBoundary")) throw new Error("Un contenu Comprendre reste chargé par le socle public");
requireText(app, "window.location.replace(route.target)", "Redirection sans entrée d’historique");
const home = await read("src/pages/HomePage.tsx");
if (home.includes('href="#/comprendre"')) throw new Error("Comprendre reste accessible depuis l’entrée Jouer");

const pages = ["UnderstandHomePage.tsx", "UnderstandModulesPage.tsx", "UnderstandReadingPathPage.tsx", "UnderstandModulePage.tsx", "UnderstandGlossaryPage.tsx", "UnderstandBibliographyPage.tsx"];
const pageText = (await Promise.all(pages.map((name) => read(`src/pages/understand/${name}`)))).join("\n");
for (const forbidden of ["dangerouslySetInnerHTML", "P01", "XP01", "mécanismeHash", "characterBiographyHash"]) if (pageText.includes(forbidden)) throw new Error(`Référence interdite dans les sources Comprendre : ${forbidden}`);
for (const expected of ["aria-expanded", "aria-controls", "aria-live", "tabIndex={-1}", "Approfondir", "Route non disponible"]) requireText(`${pageText}\n${await read("src/components/understand/UnderstandDeepDive.tsx")}\n${await read("src/components/understand/UnderstandStates.tsx")}`, expected, "Contrôle accessible des sources historiques");
for (const id of Array.from({ length: 12 }, (_, index) => `M${String(index + 1).padStart(2, "0")}`)) requireText(await read("src/data/v2/understandV2.ts"), `${id}: () => import(`, "Source historique intacte");
const index = JSON.parse(await read("src/data/generated-v2/understand/index.json"));
const glossary = JSON.parse(await read("src/data/generated-v2/understand/glossary.json"));
const bibliography = JSON.parse(await read("src/data/generated-v2/understand/bibliography.json"));
if (index.modules.length !== 12 || index.readingPaths.length !== 4 || glossary.entries.length !== 68 || bibliography.entries.length !== 164) throw new Error("Cardinalités historiques invalides");
console.log("Comprendre retiré du graphe public ; sources historiques, contrôles accessibles et cardinalités conservés.");
