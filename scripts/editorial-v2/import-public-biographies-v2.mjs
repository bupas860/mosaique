import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./editorial-config.mjs";
import { parsePublicBiographiesV2 } from "./parse-public-biographies-v2.mjs";
import { validatePublicBiographiesV2 } from "./validate-public-biographies-v2.mjs";

export const PUBLIC_BIOGRAPHIES_OUTPUT = join(ROOT, "src/data/generated-v2/public-biographies.json");
export const PUBLIC_CHARACTERS_OUTPUT = join(ROOT, "src/data/public/publicCharacters.generated.json");
export const PUBLIC_CHARACTER_ALTS_OUTPUT = join(ROOT, "src/data/generated-v2/public-character-alts.json");

function writeAtomic(output, contents) {
  const parent = dirname(output);
  mkdirSync(parent, { recursive: true });
  const temporaryRoot = mkdtempSync(join(parent, ".public-biographies-"));
  const temporaryFile = join(temporaryRoot, output.split("/").at(-1));
  try {
    writeFileSync(temporaryFile, contents, "utf8");
    if (readFileSync(temporaryFile, "utf8") !== contents) throw new Error("Écriture temporaire incomplète");
    renameSync(temporaryFile, output);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

export function importPublicBiographiesV2() {
  const data = parsePublicBiographiesV2();
  validatePublicBiographiesV2(data);
  const contents = `${JSON.stringify(data, null, 2)}\n`;
  JSON.parse(contents);
  const alternatives = `${JSON.stringify(Object.fromEntries(data.biographies.map(({ id, portraitAlt }) => [id, portraitAlt])), null, 2)}\n`;
  const publicCharacters = `${JSON.stringify({ generatedNotice: "Fichier généré. Ne pas modifier manuellement.", biographies: data.biographies }, null, 2)}\n`;
  writeAtomic(PUBLIC_BIOGRAPHIES_OUTPUT, contents);
  writeAtomic(PUBLIC_CHARACTERS_OUTPUT, publicCharacters);
  writeAtomic(PUBLIC_CHARACTER_ALTS_OUTPUT, alternatives);
  return data;
}

function main() {
  try {
    const data = importPublicBiographiesV2();
    console.log(`Import des biographies publiques réussi : ${data.biographies.length} fiches`);
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : String(cause));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
