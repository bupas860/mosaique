import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildPublicQuizzes, CHARACTER_OUTPUT, generatedCharacterQuiz, generatedSituationQuiz, SITUATION_OUTPUT } from "./lib.mjs";

function atomic(output, contents) {
  mkdirSync(path.dirname(output), { recursive: true });
  const root = mkdtempSync(path.join(path.dirname(output), ".public-quiz-"));
  try { const temp = path.join(root, path.basename(output)); writeFileSync(temp, contents, "utf8"); if (readFileSync(temp, "utf8") !== contents) throw new Error("Écriture quiz incomplète"); renameSync(temp, output); }
  finally { rmSync(root, { recursive: true, force: true }); }
}
const data = buildPublicQuizzes();
atomic(CHARACTER_OUTPUT, generatedCharacterQuiz(data));
atomic(SITUATION_OUTPUT, generatedSituationQuiz(data));
console.log("Artefacts quiz générés : 8 questions Personnages et 8 Situations fixes.");
