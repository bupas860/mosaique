import { readFileSync } from "node:fs";
import path from "node:path";
import { buildPublicReference, generatedJourney, generatedReperes, generatedWords, JOURNEY_IDS, JOURNEY_OUTPUT, REPERES_OUTPUT, ROOT, WORDS_OUTPUT } from "./lib.mjs";

const fail = (message) => { throw new Error(`Corpus public Repères et Mots utiles — ${message}`); };
const data = buildPublicReference();
if (readFileSync(REPERES_OUTPUT, "utf8") !== generatedReperes(data)) fail("artefact Repères périmé ou non déterministe");
if (readFileSync(WORDS_OUTPUT, "utf8") !== generatedWords(data)) fail("artefact Mots utiles périmé ou non déterministe");
if (readFileSync(JOURNEY_OUTPUT, "utf8") !== generatedJourney(data)) fail("projection Mots et parcours différente du corpus unique");
if (data.reperes.length !== 5 || data.reperes.map(({ id }) => id).join() !== "R1,R2,R3,R4,R5") fail("cinq Repères canoniques attendus");
if (data.reperes.map(({ publicTitle }) => publicTitle).join("|") !== "Comment jouer ?|D’où vient la marche des privilèges ?|Privilège, droit et position sociale|Normes et institutions|Aider sans imposer") fail("cinq titres publics Repères invalides");
if (data.reperes.some(({ primaryBlocks }) => primaryBlocks.length < 2)) fail("niveau principal compact absent");
if (data.reperes.some(({ sections, usefulWords, continueLinks }) => sections.length < 4 || usefulWords.length !== 3 || continueLinks.length === 0)) fail("Repère incomplet");
const repereWordLinks = data.reperes.flatMap(({ usefulWords }) => usefulWords);
const repereContinueLinks = data.reperes.flatMap(({ continueLinks }) => continueLinks);
if (repereWordLinks.length !== 15 || repereContinueLinks.length !== 10) fail(`25 liens éditoriaux Repères attendus (15 mots + 10 continuations), ${repereWordLinks.length + repereContinueLinks.length} trouvés`);
if (repereWordLinks.some(({ id, target }) => !target.startsWith(`#/mots-utiles/${id.toLowerCase()}?from=r`))) fail("destination Mot utile d’un Repère invalide");
const publicRepereSourceLinks = data.reperes.flatMap(({ sections }) => sections.flatMap(({ blocks }) => blocks.flatMap(({ text = "", items = [] }) => [text, ...items]))).flatMap((text) => [...text.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)]);
if (publicRepereSourceLinks.length !== 7) fail(`sept liens de sources publiques Repères attendus, ${publicRepereSourceLinks.length} trouvés`);
if (data.words.length !== 25 || new Set(data.words.map(({ id }) => id)).size !== 25) fail("25 mots uniques attendus");
if (data.words.filter(({ isJourneyWord }) => isJourneyWord).map(({ id }) => id).join() !== JOURNEY_IDS.join()) fail("répartition 15 Mots et parcours / 10 autres invalide");
for (const word of data.words) for (const field of ["label", "inBrief", "example", "notConfuse", "remember", "datedNote"]) if (!word[field]) fail(`${word.id} : champ ${field} absent`);

const situations = readFileSync(path.join(ROOT, "src/data/public/publicSituations.generated.ts"), "utf8");
const references = [...situations.matchAll(/"id": "(MU-[A-Z]+)"[\s\S]*?"target": "#\/mots-utiles\/(mu-[a-z]+)"/g)];
if (references.length !== 183) fail(`183 associations Situations attendues, ${references.length} trouvées`);
const known = new Set(data.words.map(({ id }) => id));
if (references.some(([, id, segment]) => !known.has(id) || segment !== id.toLowerCase())) fail("destination Situation inconnue");
const wordToRepereLinks = data.words.reduce((count, { relatedRepereIds }) => count + relatedRepereIds.length, 0);
if (wordToRepereLinks !== 11) fail(`onze renvois Mots utiles vers Repères attendus, ${wordToRepereLinks} trouvés`);

const read = (filename) => readFileSync(path.join(ROOT, filename), "utf8");
const situationWords = read("src/features/situations/UsefulWordList.tsx");
const journeyPage = read("src/features/characters/JourneyWordsPage.tsx");
const routes = read("src/utils/appRoute.ts");
const app = read("src/App.tsx");
const frame = read("src/components/public/PublicFrame.tsx");
const reperesApp = read("src/features/reperes/ReperesApp.tsx");
if (!situationWords.includes("?from=situation-") || !situationWords.includes("<a href=")) fail("liens contextuels Situations absents");
if (!journeyPage.includes("<a href={word.target}")) fail("15 liens Mots et parcours absents");
for (const expected of ["repere-detail", "useful-words", "useful-word-detail", "repereHash", "usefulWordHash"]) if (!routes.includes(expected)) fail(`route absente : ${expected}`);
for (const expected of ['lazy(() => import("./features/reperes/ReperesApp"))', 'lazy(() => import("./features/useful-words/UsefulWordsApp"))']) if (!app.includes(expected)) fail(`chargement différé absent : ${expected}`);
if (frame.includes('{ label: "Mots utiles"')) fail("Mots utiles ajouté à la navigation principale");
for (const expected of ["Quelques clés pour comprendre la marche des privilèges et les notions utilisées dans l’activité.", 'aria-expanded={open}', 'aria-controls={panelId}', 'role="region"', 'hidden={!open}', "Approfondir", "Sources", "Mots utiles", "Pour continuer", "publicTitle"]) if (!reperesApp.includes(expected)) fail(`interface compacte Repères incomplète : ${expected}`);
for (const forbidden of ['className="reference-id"', "Lire ce repère", "repere.title}</h1>"]) if (reperesApp.includes(forbidden)) fail(`présentation Repères obsolète : ${forbidden}`);

const serialized = `${JSON.stringify(data.reperes)}${JSON.stringify(data.words)}`;
for (const forbidden of ["module Comprendre", "registre complet", "feedbacksByCharacter", "gamePoints", "décisions par personnage", "note de validation"]) if (serialized.includes(forbidden)) fail(`champ ou contenu interne détecté : ${forbidden}`);

console.log("Corpus public conforme : 5 Repères compactés, 25 Mots utiles (15 + 10) et 198 liens différés activés (183 Situations + 15 Mots et parcours).");
console.log("Liens Repères contrôlés séparément : 25 liens éditoriaux internes (15 mots + 10 continuations), 7 sources publiques ; 11 renvois Mots utiles vers Repères et aucun renvoi entre Mots utiles.");
console.log("Artefacts reproductibles, corpus unique et chargements différés : conformes.");
