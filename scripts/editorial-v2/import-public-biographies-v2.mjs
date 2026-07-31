import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./editorial-config.mjs";
import { parsePublicBiographiesV2 } from "./parse-public-biographies-v2.mjs";
import { validatePublicBiographiesV2 } from "./validate-public-biographies-v2.mjs";

export const PUBLIC_BIOGRAPHIES_OUTPUT = join(ROOT, "src/data/generated-v2/public-biographies.json");

export function importPublicBiographiesV2() {
  const data = parsePublicBiographiesV2();
  validatePublicBiographiesV2(data);
  const contents = `${JSON.stringify(data, null, 2)}\n`;
  JSON.parse(contents);
  const parent = dirname(PUBLIC_BIOGRAPHIES_OUTPUT);
  mkdirSync(parent, { recursive: true });
  const temporaryRoot = mkdtempSync(join(parent, ".public-biographies-"));
  const temporaryFile = join(temporaryRoot, "public-biographies.json");
  try {
    writeFileSync(temporaryFile, contents, "utf8");
    if (readFileSync(temporaryFile, "utf8") !== contents) throw new Error("Écriture temporaire incomplète");
    renameSync(temporaryFile, PUBLIC_BIOGRAPHIES_OUTPUT);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
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
