import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { checkPublicBiographiesV2 } from "../editorial-v2/check-public-biographies-v2.mjs";
import { parsePublicBiographiesV2 } from "../editorial-v2/parse-public-biographies-v2.mjs";
import { validatePublicBiographiesV2 } from "../editorial-v2/validate-public-biographies-v2.mjs";
import { buildPublicJourneyWords, EXPECTED_WORD_IDS, generatedSource, OUTPUT, ROOT } from "./lib.mjs";

const fail = (message) => { throw new Error(`Corpus public Personnages — ${message}`); };
const biographies = parsePublicBiographiesV2();
validatePublicBiographiesV2(biographies);
checkPublicBiographiesV2();
const journey = buildPublicJourneyWords();
if (readFileSync(OUTPUT, "utf8") !== generatedSource(journey)) fail("artefact Mots et parcours périmé ou non déterministe");
if (journey.words.length !== 15 || journey.words.map(({ id }) => id).join(",") !== EXPECTED_WORD_IDS.join(",")) fail("15 mots attendus dans l’ordre de 091 V2");
if (journey.words.some(({ status, target }) => status !== "deferred" || !target.startsWith("#/mots-utiles/"))) fail("destination future d’un mot invalide");
const expectedIds = biographies.biographies.map(({ id }) => id);
for (const biography of biographies.biographies) {
  const folder = biography.id.startsWith("XP") ? "intersectional" : "general";
  const portrait = path.join(ROOT, "src/assets/illustrations/characters", folder, `${biography.id.toLowerCase()}.webp`);
  if (!existsSync(portrait) || statSync(portrait).size === 0) fail(`${biography.id} : portrait absent`);
  if (biography.sections.length !== 13 || biography.sections.some(({ number }) => number > 13)) fail(`${biography.id} : rubrique interne présente`);
}
const tagsSource = readFileSync(path.join(ROOT, "src/data/public/characterPublicTagsV2.ts"), "utf8");
const transpiled = ts.transpileModule(tagsSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } }).outputText;
const tags = (await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`)).publicCharacterTagsV2;
if (Object.keys(tags).join(",") !== expectedIds.join(",") || expectedIds.some((id) => !Array.isArray(tags[id]) || tags[id].length < 2)) fail("étiquettes publiques absentes ou mal jointes");
const read = (filename) => readFileSync(path.join(ROOT, filename), "utf8");
const routes = read("src/utils/appRoute.ts");
const app = read("src/App.tsx");
const charactersApp = read("src/features/characters/CharactersApp.tsx");
const gallery = read("src/pages/ExplorerCharactersPage.tsx");
const detail = read("src/pages/CharacterBiographyPage.tsx");
const accordion = read("src/components/BiographyAccordion.tsx");
const contentBlocks = read("src/components/BiographyContentBlocks.tsx");
const disclosureMap = read("src/components/BiographyDisclosureMap.tsx");
const styles = read("src/index.css");
const wordsPage = read("src/features/characters/JourneyWordsPage.tsx");
for (const expected of ["mots-et-parcours", "${PERSONNAGES_HASH}/quiz", "characterRoute", "characterBiographyHash(characterId)"]) if (!routes.includes(expected)) fail(`contrat de route absent : ${expected}`);
if (!app.includes('lazy(() => import("./features/characters/CharactersApp"))') || app.includes('from "./data/v2/publicBiographiesV2"')) fail("chargement différé Personnages invalide");
for (const expected of ["Personnages — Mosaïque", "Mots et parcours — Personnages — Mosaïque", "biography.galleryLabel", 'getElementById("main-content")']) if (!charactersApp.includes(expected)) fail(`contrat CharactersApp absent : ${expected}`);
for (const expected of ["Découvrir son parcours", "biography.shortDescription", "biography.portraitAlt", "CharacterPublicTags", "Mots et parcours"]) if (!gallery.includes(expected)) fail(`contrat galerie absent : ${expected}`);
for (const expected of [
  "Mots et parcours", "Personnage précédent", "Personnage suivant", "Retour aux personnages",
  "publicBiographiesV2.findIndex", "overview: true", "journey: false", "privacy: false", "school: false",
  "Vue d’ensemble", "Son parcours", "Entourage et confidentialité", "Au lycée",
  "Cette fiche donne au lecteur des informations que le lycée fictif, les autres personnages ou l’entourage ne connaissent pas nécessairement. Elles ne doivent pas être utilisées comme si elles étaient publiques dans l’histoire.",
  "Les personnes informées varient selon les espaces. Lire cette fiche ne rend pas ces informations publiques dans l’histoire.",
]) if (!detail.includes(expected)) fail(`contrat fiche absent : ${expected}`);
if ((detail.match(/id: "(?:overview|journey|privacy|school)"/g) ?? []).length !== 4) fail("quatre ensembles biographiques attendus");
if (!accordion.includes("aria-expanded={open}") || !accordion.includes("hidden={!open}")) fail("état accessible des accordéons absent");
if (!contentBlocks.includes('<ol key={index} className="biography-timeline">')) fail("chronologie ordonnée absente");
for (const expected of ["Espace ou groupe", "Situation actuelle", 'data-label="Situation actuelle"']) if (!disclosureMap.includes(expected)) fail(`cartographie incomplète : ${expected}`);
for (const expected of [".biography-disclosure-map thead", ".biography-disclosure-map tr", "display: block", "width: 100%"] ) if (!styles.includes(expected)) fail(`cartographie responsive incomplète : ${expected}`);
if (!gallery.includes("biography.age") || !gallery.includes("biography.schoolLevel") || !gallery.includes("biography.galleryLabel") || !gallery.includes("biography.id")) fail("identité visible incomplète dans la galerie");
if (!detail.includes("biography.age") || !detail.includes("biography.schoolLevel") || !detail.includes("biography.galleryLabel") || !detail.includes("biography.id")) fail("identité visible incomplète dans la fiche");
if (detail.includes("journeyWordIds") || detail.includes("usefulWords.filter")) fail("association biographique déduite sans table validée");
if (wordsPage.includes("<a href={word.target}") || wordsPage.includes("En bref") || wordsPage.includes("À retenir")) fail("lien mort ou définition concurrente dans Mots et parcours");
if (!wordsPage.includes("publicJourneyWords.map") || !wordsPage.includes("Retour aux personnages")) fail("page Mots et parcours incomplète");
const serialized = JSON.stringify(biographies);
for (const forbidden of ['"number":14', '"number":15', '"number":16', '"number":17', "Volet réservé au formateur", "feedbacksByCharacter", "gamePoints"]) if (serialized.includes(forbidden)) fail(`contenu interne détecté : ${forbidden}`);
for (const [left, right] of [["P01", "XP08"], ["P02", "XP05"], ["P05", "XP06"], ["P08", "XP07"]]) {
  const a = biographies.biographies.find(({ id }) => id === left);
  const b = biographies.biographies.find(({ id }) => id === right);
  if (!a || !b || a.name !== b.name || a.portraitId === b.portraitId || a.shortDescription === b.shortDescription || a.portraitAlt === b.portraitAlt) fail(`collision d’homonymes ${left}/${right}`);
}
if (biographies.biographies.length !== 17 || biographies.biographies.filter(({ id }) => /^P\d{2}$/.test(id)).length !== 9 || biographies.biographies.filter(({ id }) => /^XP\d{2}$/.test(id)).length !== 8) fail("répartition 9 P / 8 XP invalide");
if (biographies.biographies.reduce((sum, biography) => sum + biography.sections.length, 0) !== 221) fail("221 rubriques publiques attendues");
for (const forbidden of ["find(({ name", "find((character) => character.name", "[biography.name]", "[character.name]"]) {
  for (const [filename, source] of [["routes", routes], ["galerie", gallery], ["fiche", detail], ["application", charactersApp]]) {
    if (source.includes(forbidden)) fail(`${filename} : jointure potentielle par prénom détectée`);
  }
}
console.log("Corpus public Personnages conforme : 17 fiches, 9 P, 8 XP, 221 rubriques publiques, 17 portraits, 17 alternatives et 15 mots.");
console.log("Aucune table publique personnage/mot validée : accès général appliqué conformément à 141 V2 § 9.6.");
