import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildPublicSituations, generatedSource, OUTPUT, validatePublicSituations } from "./lib.mjs";

const data = buildPublicSituations();
validatePublicSituations(data);
mkdirSync(path.dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, generatedSource(data));
console.log(`Artefact public généré : ${data.situations.length} situations, ${data.focals.length} focales.`);
