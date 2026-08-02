import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildPublicJourneyWords, generatedSource, OUTPUT } from "./lib.mjs";

const contents = generatedSource(buildPublicJourneyWords());
mkdirSync(path.dirname(OUTPUT), { recursive: true });
const temporaryRoot = mkdtempSync(path.join(path.dirname(OUTPUT), ".public-characters-"));
const temporaryFile = path.join(temporaryRoot, path.basename(OUTPUT));
try {
  writeFileSync(temporaryFile, contents, "utf8");
  if (readFileSync(temporaryFile, "utf8") !== contents) throw new Error("Écriture temporaire incomplète");
  renameSync(temporaryFile, OUTPUT);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
console.log("Artefact Mots et parcours généré : 15 entrées publiques, aucune association biographique déduite.");
