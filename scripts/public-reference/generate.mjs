import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildPublicReference, generatedJourney, generatedReperes, generatedWords, JOURNEY_OUTPUT, REPERES_OUTPUT, WORDS_OUTPUT } from "./lib.mjs";

function writeAtomic(output, contents) {
  mkdirSync(path.dirname(output), { recursive: true });
  const temporaryRoot = mkdtempSync(path.join(path.dirname(output), ".public-reference-"));
  const temporary = path.join(temporaryRoot, path.basename(output));
  try { writeFileSync(temporary, contents, "utf8"); if (readFileSync(temporary, "utf8") !== contents) throw new Error("Écriture temporaire incomplète"); renameSync(temporary, output); }
  finally { rmSync(temporaryRoot, { recursive: true, force: true }); }
}

const data = buildPublicReference();
writeAtomic(REPERES_OUTPUT, generatedReperes(data));
writeAtomic(WORDS_OUTPUT, generatedWords(data));
writeAtomic(JOURNEY_OUTPUT, generatedJourney(data));
console.log("Artefacts publics générés : 5 Repères, 25 Mots utiles et 15 destinations Mots et parcours.");
