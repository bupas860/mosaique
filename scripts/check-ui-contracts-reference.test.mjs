import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertPortraitContract } from "./check-ui-contracts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reference = await readFile(path.join(root, "src/components/CharacterPortrait.tsx"), "utf8");

function mustReject(content, label) {
  try {
    assertPortraitContract(content, reference);
  } catch {
    return;
  }
  throw new Error(`Mutation non détectée : ${label}`);
}

assertPortraitContract(reference, reference);

mustReject(
  reference.replace("../data/public/characterPortraitAltsV2", "../data/v2/publicBiographiesV2"),
  "retour à l’ancienne source interne",
);
mustReject(
  reference.replace("character-portrait__image character-portrait__image--loaded", "character-portrait__image portrait-modifie"),
  "modification visible arbitraire",
);

console.log("Référence Portrait conforme : état 8D accepté, source non autorisée et mutation visible refusées.");
