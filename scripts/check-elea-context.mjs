import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (filename) => readFile(path.join(root, filename), "utf8");
const routesSource = await read("src/utils/appRoute.ts");
const routesModule = ts.transpileModule(routesSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } }).outputText;
const routes = await import(`data:text/javascript;base64,${Buffer.from(routesModule).toString("base64")}`);

for (const search of ["?context=elea", "?foo=1&context=elea"]) if (!routes.isEleaContext(search)) throw new Error(`Contexte Éléa refusé : ${search}`);
for (const search of ["", "?context=test", "?context=ELEA", "?context=elea2"]) if (routes.isEleaContext(search)) throw new Error(`Contexte Éléa activé à tort : ${search || "(vide)"}`);
for (const [hash, kind] of [["#/personnages", "explorer-characters"], ["#/jouer", "game"], ["#/situations/X01", "situation-detail"], ["#/situations/X13", "situation-detail"], ["#/reperes", "reperes"]]) {
  if (routes.parseAppRoute(hash).kind !== kind) throw new Error(`Deep link Éléa invalide : ${hash}`);
}

const frame = await read("src/components/public/PublicFrame.tsx");
for (const expected of ['const eleaPresentation = isEleaContext()', '!eleaPresentation && <nav', '<span className="public-brand">{PUBLIC_BRAND}</span>', 'public-footer--elea']) if (!frame.includes(expected)) throw new Error(`Chrome Éléa incomplet : ${expected}`);
for (const expected of ['className="skip-link"', 'href="#main-content"', 'id="main-content"', 'tabIndex={-1}', 'event.key !== "Escape"', 'menuButton.current?.focus()']) if (!frame.includes(expected)) throw new Error(`Contrat accessible absent : ${expected}`);
const gallery = await read("src/pages/ExplorerCharactersPage.tsx");
if (!gallery.includes('!eleaPresentation && <a href="#/"') || gallery.includes('#/personnages/quiz')) throw new Error("Allègement de la galerie Personnages ou retrait de la promotion Quiz incomplet");
if (routes.parseAppRoute("#/personnages/quiz").kind !== "character-quiz") throw new Error("Route directe Quiz Personnages supprimée");

console.log("Contexte Éléa contrôlé : valeur exacte, cinq deep links, accueil et chrome réduits, route Quiz Personnages conservée.");
