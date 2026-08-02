import { readFileSync } from "node:fs";
import { buildPublicQuizzes, CHARACTER_OUTPUT, generatedCharacterQuiz, generatedSituationQuiz, SITUATION_ORDER, SITUATION_OUTPUT } from "./lib.mjs";

const fail = (message) => { throw new Error(`Quiz publics — ${message}`); };
const data = buildPublicQuizzes();
if (readFileSync(CHARACTER_OUTPUT, "utf8") !== generatedCharacterQuiz(data)) fail("artefact Personnages périmé ou non reproductible");
if (readFileSync(SITUATION_OUTPUT, "utf8") !== generatedSituationQuiz(data)) fail("artefact Situations périmé ou non reproductible");
if (data.characters.questions.map(({ id }) => id).join() !== "QP01,QP02,QP03,QP04,QP05,QP06,QP07,QP08") fail("ordre Personnages invalide");
if (data.situations.questions.map(({ code }) => code).join() !== SITUATION_ORDER.join()) fail("ordre Situations invalide");
if (data.characters.questions.some(({ feedback, remember, expected }) => !feedback || !remember || expected.length === 0)) fail("question Personnages incomplète");
if (data.situations.questions.some(({ altText, canonicalText, feedback, expectedFocal, expectedRole }) => !altText || !canonicalText || feedback.length < 3 || !expectedFocal || !expectedRole)) fail("question Situations incomplète");
const serialized = JSON.stringify(data);
for (const forbidden of ["feedbacksByCharacter", "gamePoints", "matrice", "rubrique 14", "Volet réservé au formateur", "Source précise", "Décision finale"]) if (serialized.includes(forbidden)) fail(`champ interne publié : ${forbidden}`);
console.log("Quiz publics conformes : 8 questions Personnages et 8 Situations dans l’ordre N02, V10, X01, I01, N13, X13, V01, I14.");
console.log("Artefacts reproductibles, feedbacks exacts, vigilance I01 contrôlée uniquement dans 098 V3.");
