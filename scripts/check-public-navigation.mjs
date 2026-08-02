import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (filename) => readFile(path.join(root, filename), "utf8");
const requireText = (content, expected, label) => {
  if (!content.includes(expected)) throw new Error(`${label} absent : ${expected}`);
};

const routeSource = await read("src/utils/appRoute.ts");
const routeModule = ts.transpileModule(routeSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
}).outputText;
const routes = await import(`data:text/javascript;base64,${Buffer.from(routeModule).toString("base64")}`);

const cases = [
  ["", "home"], ["#", "home"], ["#/", "home"],
  ["#/jouer", "game"], ["#/personnages", "explorer-characters"],
  ["#/situations", "situations"], ["#/reperes", "reperes"],
  ["#/explorer/personnages/P01", "character-biography"],
  ["#/inconnue", "not-found"],
];
for (const [hash, kind] of cases) {
  const actual = routes.parseAppRoute(hash);
  if (actual.kind !== kind) throw new Error(`Route ${hash || "(vide)"} : ${actual.kind} au lieu de ${kind}`);
}
const redirects = [
  ["#/explorer/personnages", "#/personnages"],
  ["#/comprendre", "#/reperes"],
  ["#/comprendre/modules", "#/reperes"],
  ["#/comprendre/modules/M12/section/usage", "#/reperes"],
  ["#/comprendre/glossaire/notion", "#/reperes"],
  ["#/comprendre/bibliographie/S164", "#/reperes"],
];
for (const [hash, target] of redirects) {
  const actual = routes.parseAppRoute(hash);
  if (actual.kind !== "redirect" || actual.target !== target) throw new Error(`Redirection invalide : ${hash}`);
}
if (routes.parseAppRoute("#/comprendre/route-invalide").kind !== "not-found") throw new Error("Une route Comprendre inconnue est redirigée par approximation");

const home = await read("src/pages/public/PublicHomePage.tsx");
const homeOrder = ["Jouer", "Personnages", "Situations", "Repères"].map((label) => home.indexOf(`title: "${label}"`));
if (homeOrder.some((index) => index < 0) || homeOrder.some((index, position) => position > 0 && index <= homeOrder[position - 1])) throw new Error("Ordre ou cardinalité des quatre entrées d’accueil invalide");
for (const expected of ['href: GAME_HASH', 'href: PERSONNAGES_HASH', 'href: SITUATIONS_HASH', 'href: REPERES_HASH', 'primary: true']) requireText(home, expected, "Accueil public");
for (const forbidden of ["Comprendre", "progression", "score", "classement"]) if (home.includes(forbidden)) throw new Error(`Contenu interdit sur l’accueil : ${forbidden}`);

const frame = await read("src/components/public/PublicFrame.tsx");
for (const expected of [
  "Aller au contenu principal", 'href="#main-content"', '<header', '<nav', 'aria-label="Navigation principale"',
  'aria-current=', 'aria-expanded={menuOpen}', 'aria-controls="public-mobile-menu"', 'event.key !== "Escape"',
  'menuButton.current?.focus()', 'hidden={!menuOpen}', 'onClick={mobile ? () => setMenuOpen(false)',
  'id="main-content"', 'tabIndex={-1}', '<footer',
]) requireText(frame, expected, "Cadre public accessible");
const navigationOrder = ["Jouer", "Personnages", "Situations", "Repères"].map((label) => frame.indexOf(`label: "${label}"`));
if (navigationOrder.some((index) => index < 0) || navigationOrder.some((index, position) => position > 0 && index <= navigationOrder[position - 1])) throw new Error("Ordre de navigation invalide");
if (frame.includes("Comprendre")) throw new Error("Comprendre reste dans la navigation principale");

const app = await read("src/App.tsx");
for (const expected of [
  'lazy(() => import("./game/GameApp"))', "window.location.replace(route.target)",
  'document.title = titleForRoute(route)', 'document.getElementById("main-content")?.focus({ preventScroll: true })',
  'home: "Mosaïque"', 'game: "Jouer — Mosaïque"', '"not-found": "Page introuvable — Mosaïque"',
]) requireText(app, expected, "Routage public");
if (app.includes('import("./pages/understand/') || app.includes('from "./game/GameApp"')) throw new Error("Chargement public non différé détecté");

const situations = await read("src/pages/public/StructuralPage.tsx");
for (const forbidden of ["generated-v2", "matrix", "feedback", "understand", "139_"]) if (situations.includes(forbidden)) throw new Error(`Dépendance interdite dans la page structurelle : ${forbidden}`);
const notFound = await read("src/pages/public/NotFoundPage.tsx");
for (const expected of ["Page introuvable", "Cette page n’existe pas.", "Accueil", "Jouer"]) requireText(notFound, expected, "Page inconnue");
if (notFound.includes("fragment")) throw new Error("Le fragment inconnu est rendu dans la page");

console.log(`Navigation publique contrôlée : ${cases.length} routes, ${redirects.length} redirections, 4 espaces principaux.`);
console.log("Accueil, titres, focus, menu mobile, page inconnue et retrait public de Comprendre : conformes.");
