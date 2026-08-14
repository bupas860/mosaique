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
const card = readApp("features/situations/PublicSituationCard.tsx");
for (const text of ["Explorez des situations ordinaires du lycée pour comprendre ce qui peut créer un obstacle, ce qui peut protéger, et pourquoi une même situation ne se vit pas de la même manière pour tout le monde.", "La focale", "Le rôle", "Toutes les focales", "Tous les rôles", "Obstacle", "Protection", "Réinitialiser les filtres", "Aucune situation ne correspond à ces filtres.", "Tester votre compréhension des situations", 'role="status"', 'aria-live="polite"']) if (!gallery.includes(text)) throw new Error(`Contrat galerie absent : ${text}`);
for (const description of ["Quand une règle, un lieu ou une procédure crée directement une difficulté.", "Quand des attentes considérées comme normales peuvent exclure ou contraindre.", "Quand les conséquences d’une situation ne se voient pas immédiatement.", "Quand plusieurs rapports sociaux se combinent et modifient une même situation."]) if (!gallery.includes(description)) throw new Error(`Porte d’entrée de focale absente : ${description}`);
for (const heading of ["La situation présentée dans le jeu", "Comprendre", "Ce qui se joue ici", "Pourquoi cela compte", "Angle d’analyse", "Ce qui peut aider", "Un autre angle", "Mots utiles", "Continuer", 'role="tablist"', 'role="tabpanel"', 'aria-selected={selected}', 'aria-expanded={open}']) if (!detail.includes(heading)) throw new Error(`Rubrique de fiche absente : ${heading}`);
for (const obsolete of ["Ce qu’il faut observer", "La focale principale de Mosaïque", "Pourquoi cela peut compter", "Ce qui pourrait protéger", "Une autre lecture possible", "public-situation-detail__code"]) if (detail.includes(obsolete)) throw new Error(`Ancien libellé visible dans la fiche : ${obsolete}`);
for (const text of ["Approfondir cette focale", "Comment la reconnaître ?", "À ne pas confondre", "À retenir", "Voir l’ensemble des situations", 'aria-expanded={open}', "showFocal={false}"]) if (!focal.includes(text)) throw new Error(`Contrat focale absent : ${text}`);
if (!card.includes("Découvrir la situation") || card.includes("public-situation-card__code")) throw new Error("Le code technique doit être absent des cartes et l’action de lecture présente");
for (const text of ['width="1000"', 'height="800"', 'loading={eager ? "eager" : "lazy"}', 'aria-label={altText}']) if (!image.includes(text)) throw new Error(`Contrat image absent : ${text}`);
if (!words.includes("<a href=") || !words.includes("situationCode") || words.includes("public-useful-words__id")) throw new Error("Les 183 destinations Mots utiles doivent rester activables sans code technique visible");
for (const title of ['publicDocumentTitle("Situations")', 'publicDocumentTitle("Situations", publicFocals.find', 'publicDocumentTitle("Situations", situation.title)']) if (!application.includes(title)) throw new Error(`Titre de document Situations absent : ${title}`);
if (application.includes("`${situation.code}")) throw new Error("Le code technique ne doit pas entrer dans le titre du document d’une fiche ordinaire");

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
