import { pathToFileURL } from "node:url";

import { EXPECTED_SELECTION_COUNTS } from "./editorial-config.mjs";
import { parseEditorialV2 } from "./parse-editorial-v2.mjs";
import { assertSelectionReferences } from "./selection-analysis.mjs";

export function checkAllSelections(data = parseEditorialV2()) {
  const result = assertSelectionReferences(data);
  if (result.errors.length > 0) throw new Error(result.errors.join("\n"));
  return result.analyses;
}

function main() {
  try {
    const analyses = checkAllSelections();
    const visible = analyses["visible-obstacles"];
    console.log("Vérification des tirages V2 réussie");
    console.log(`Obstacles visibles : ${visible.examinedCount} examinés, ${visible.validForAllCharactersCount} valides pour toute la galerie`);
    const ordinary = analyses["ordinary-norms"];
    console.log(`Normes ordinaires : ${ordinary.thematicCount} lots thématiques ; Arthur ${ordinary.countsByCharacter.P04}, autres ${ordinary.countsByCharacter.P01}`);
    const invisible = analyses["invisible-effects"];
    console.log(`Effets invisibles : ${invisible.thematicCount} lots thématiques ; ${Object.entries(invisible.countsByCharacter).map(([id, count]) => `${id} ${count}`).join(", ")}`);
    const intersectional = analyses.intersectionalities;
    console.log(`Intersectionnalités : ${Object.entries(intersectional.countsByCharacter).map(([id, count]) => `${id} ${count}`).join(", ")}`);
    console.log(`Découverte : ${Object.entries(analyses.discovery).map(([id, item]) => `${id} ${item.validCount}`).join(", ")}`);
    console.log("Découverte : tous les profils combinatoires valides sont ordonnançables");
    if (visible.validForAllCharactersCount !== EXPECTED_SELECTION_COUNTS["visible-obstacles"].allCharacters) throw new Error("régression du contrôle historique Obstacles visibles");
  } catch (cause) {
    console.error(`Vérification des tirages V2 impossible : ${cause instanceof Error ? cause.message : String(cause)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
