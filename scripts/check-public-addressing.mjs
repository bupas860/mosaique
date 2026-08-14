import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (base, filename) => readFile(path.join(base, filename), "utf8");
const forbidden = /(?<!\p{L})(?:tu|toi|te|ton|ta|tes)(?!\p{L})|(?<!\p{L})t[’']/iu;
const forbiddenImperative = /(?<!\p{L})(?:choisis|découvre|observe|regarde|compare|cherche|repère|retrouve|réponds|sélectionne|valide|utilise|lis|décide|consulte|commence|lance|explore)(?!\p{L})/iu;
const forbiddenImperativeStart = /^\s*(?:choisis|découvre|observe|regarde|compare|cherche|repère|retrouve|réponds|sélectionne|valide|utilise|lis|décide|consulte|commence|lance|explore)(?!\p{L})/iu;
const protectedHashes = {
  canonicalText: "3e6202b87e0683aef0ff21620ec9945925d8b7489914d778089e157d87054a4d",
  situationAltText: "e75b48af11ce920754b21da892980048ce345cfb8284c77093771ddfe4233e5e",
  portraitAltText: "685359dc71240d59cce67f841d9cac7fb43bd40ee08b3d766cdff3a5a518a584",
};

function assertAddressing(values, label, checkImperatives = false) {
  for (const value of values) {
    if (forbidden.test(value) || (checkImperatives && forbiddenImperative.test(value))) throw new Error(`${label} réintroduit le tutoiement : ${JSON.stringify(value)}`);
  }
}

function assertImperatives(values, label) {
  for (const value of values) if (forbiddenImperativeStart.test(value)) throw new Error(`${label} réintroduit un impératif au tutoiement : ${JSON.stringify(value)}`);
}

const reperes = JSON.parse(await read(root, "src/data/public/publicReperes.generated.json")).reperes;
assertAddressing(reperes.flatMap((repere) => [repere.publicTitle, repere.introduction, repere.inBrief, repere.continueText, ...repere.primaryBlocks.flatMap((block) => block.text ? [block.text] : block.items ?? []), ...repere.sections.flatMap(({ title, blocks }) => [title, ...blocks.flatMap((block) => block.text ? [block.text] : block.items ?? [])])]), "Repères");
assertAddressing(reperes.map(({ continueText }) => continueText), "Renvois Repères", true);

const characterQuiz = JSON.parse(await read(root, "src/data/public/publicCharacterQuiz.generated.json")).quiz;
assertAddressing([characterQuiz.introduction], "Quiz Personnages");
assertAddressing(characterQuiz.questions.map(({ instruction }) => instruction), "Consignes Quiz Personnages", true);
const situationQuiz = JSON.parse(await read(root, "src/data/public/publicSituationQuiz.generated.json")).quiz;
assertAddressing(situationQuiz.questions.map(({ instruction }) => instruction).filter(Boolean), "Quiz Situations", true);

const uiFiles = [
  "src/features/quiz/CharacterQuizApp.tsx",
  "src/features/quiz/SituationQuizApp.tsx",
  "src/pages/public/PublicHomePage.tsx",
  "src/pages/HomePage.tsx",
  "src/pages/ModeSelectionPage.tsx",
  "src/pages/CharacterSelectionPage.tsx",
  "src/pages/GamePreparationPage.tsx",
  "src/pages/GamePage.tsx",
  "src/pages/FinalSummaryPage.tsx",
];
for (const filename of uiFiles) assertAddressing([await read(root, filename)], filename, true);

const currentSituationsSource = await read(root, "src/data/public/publicSituations.generated.ts");
const parseSituations = (source) => JSON.parse(source.match(/export const publicSituations = (\[[\s\S]*\]) as const satisfies readonly PublicSituation\[\];/)?.[1] ?? "null");
const currentSituations = parseSituations(currentSituationsSource);
if (!currentSituations || currentSituations.length !== 61) throw new Error("Corpus Situations public illisible");
const hash = (values) => createHash("sha256").update(JSON.stringify(values)).digest("hex");
if (hash(currentSituations.map(({ canonicalText }) => canonicalText)) !== protectedHashes.canonicalText) throw new Error("Textes canoniques Situations modifiés");
if (hash(currentSituations.map(({ altText }) => altText)) !== protectedHashes.situationAltText) throw new Error("Textes alternatifs Situations modifiés");
const situationsIntroduction = JSON.parse(currentSituationsSource.match(/export const publicSituationsIntroduction = ({[\s\S]*?}) as const satisfies PublicSituationsIntroduction;/)?.[1] ?? "null");
const publicFocals = JSON.parse(currentSituationsSource.match(/export const publicFocals = (\[[\s\S]*?\]) as const satisfies readonly PublicFocal\[\];/)?.[1] ?? "null");
if (!situationsIntroduction || !publicFocals) throw new Error("Introduction ou focales Situations illisibles");
assertAddressing([situationsIntroduction.warning, ...currentSituations.map(({ continueTarget }) => continueTarget.prefix)], "Situations", true);
assertImperatives(publicFocals.flatMap(({ recognize }) => recognize), "Introductions de focales");

const currentCharacters = JSON.parse(await read(root, "src/data/public/publicCharacters.generated.json")).biographies;
if (currentCharacters.length !== 17) throw new Error("Corpus Personnages public illisible");
if (hash(currentCharacters.map(({ portraitAlt }) => portraitAlt)) !== protectedHashes.portraitAltText) throw new Error("Textes alternatifs Portraits modifiés");

console.log("Vouvoiement contrôlé dans les champs d’adresse publics et les microcontenus d’interface.");
console.log("Contenus protégés inchangés : 61 textes canoniques, 61 alternatives Situations et 17 alternatives Portraits.");
