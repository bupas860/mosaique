import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { buildPublicSituations, generatedSource, OUTPUT, validatePublicSituations } from "./lib.mjs";

const data = buildPublicSituations();
validatePublicSituations(data);
const expected = generatedSource(data);
const observed = readFileSync(OUTPUT, "utf8");
if (observed !== expected) throw new Error("Artefact public Situations périmé : exécuter npm run situations:generate-public");

const readApp = (filename) => readFileSync(path.join(path.dirname(OUTPUT), "../..", filename), "utf8");
const gallery = readApp("features/situations/SituationsGalleryPage.tsx");
const detail = readApp("features/situations/SituationDetailPage.tsx");
const focal = readApp("features/situations/SituationsFocalPage.tsx");
const image = readApp("features/situations/PublicSituationImage.tsx");
const words = readApp("features/situations/UsefulWordList.tsx");
const application = readApp("features/situations/SituationsApp.tsx");
for (const text of ["Toutes les focales", "Tous les rôles", "Obstacle", "Protection", "Réinitialiser les filtres", "Aucune situation ne correspond à ces filtres.", 'role="status"', 'aria-live="polite"']) if (!gallery.includes(text)) throw new Error(`Contrat galerie absent : ${text}`);
for (const heading of ["La situation présentée dans le jeu", "Ce qu’il faut observer", "La focale principale de Mosaïque", "Pourquoi cela peut compter", "Une autre lecture possible", "Mots utiles", "Continuer"]) if (!detail.includes(heading)) throw new Error(`Rubrique de fiche absente : ${heading}`);
for (const text of ["Comment la reconnaître ?", "À ne pas confondre", "À retenir", "Voir l’ensemble des situations"]) if (!focal.includes(text)) throw new Error(`Contrat focale absent : ${text}`);
for (const text of ['width="1000"', 'height="800"', 'loading={eager ? "eager" : "lazy"}', 'aria-label={altText}']) if (!image.includes(text)) throw new Error(`Contrat image absent : ${text}`);
if (words.includes("<a ")) throw new Error("Les Mots utiles deviennent des liens avant 8E");
for (const title of ["Situations — Mosaïque", "— Situations — Mosaïque", "— Mosaïque"]) if (!application.includes(title)) throw new Error(`Titre de document Situations absent : ${title}`);

const filterSource = readApp("features/situations/situationFilters.ts");
const transpiled = ts.transpileModule(filterSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } }).outputText;
const filters = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
for (const [focalId, expectedCount] of [["V", 16], ["N", 13], ["I", 16], ["X", 16]]) {
  if (filters.filterPublicSituations(data.situations, focalId, "all").length !== expectedCount) throw new Error(`Filtre focale ${focalId} invalide`);
  if (filters.filterPublicSituations(data.situations, focalId, "protection").length !== 2) throw new Error(`Filtre protection ${focalId} invalide`);
}
if (filters.filterPublicSituations(data.situations, "all", "obstacle").length !== 53 || filters.filterPublicSituations(data.situations, "all", "protection").length !== 8) throw new Error("Filtres de rôle invalides");
if (filters.filterPublicSituations(data.situations, "Z", "all").length !== 0) throw new Error("État vide défensif invalide");
console.log("Corpus public Situations conforme : 61 fiches, 4 focales, 53 obstacles, 8 protections, 183 mots utiles et 61 renvois.");
