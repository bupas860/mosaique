import { pathToFileURL } from "node:url";
import { parsePublicBiographiesV2, PUBLIC_BIOGRAPHY_IDS } from "./parse-public-biographies-v2.mjs";

export const FORBIDDEN_PUBLIC_BIOGRAPHY_STRINGS = [
  "Volet réservé au formateur",
  "Données opératoires",
  "Données contextuelles",
  "Informations confidentielles dans l’univers du personnage",
  "Conflits potentiels avec la matrice",
  "Situations particulièrement concernées",
];

const fail = (message) => { throw new Error(`Validation des biographies publiques — ${message}`); };
const expectedTitles = {
  1: ["Identité dans le jeu"],
  2: ["Vie quotidienne et centres d’intérêt"],
  3: ["Histoire de son rapport à soi", "Histoire de son rapport à elle-même"],
  4: ["Chronologie indicative"],
  5: ["Coming in et questionnement"],
  6: ["Cartographie des dévoilements"],
  7: ["Réactions de l’entourage"],
  8: ["Ressources et soutiens"],
  9: ["Parcours d’affirmation, démarches et accompagnements éventuels"],
  10: ["Vécu scolaire"],
  11: ["Expériences positives et ordinaires"],
  12: ["Souhaits et limites actuels"],
  13: ["Ce que le lycée sait réellement"],
};

export function validatePublicBiographiesV2(data) {
  if (data.schemaVersion !== 1 || data.sourceFile !== "docs/editorial-v2/biographies/046_Biographies_approfondies_17_personnages_V1.md") fail("métadonnées inattendues");
  if (!Array.isArray(data.biographies) || data.biographies.length !== 17) fail("17 biographies attendues");
  const ids = data.biographies.map(({ id }) => id);
  if (ids.join("|") !== PUBLIC_BIOGRAPHY_IDS.join("|")) fail("identifiants absents, dupliqués ou mal ordonnés");
  if (ids.filter((id) => /^P\d{2}$/.test(id)).length !== 9 || ids.filter((id) => /^XP\d{2}$/.test(id)).length !== 8) fail("répartition P/XP incorrecte");
  for (const biography of data.biographies) {
    const allowedKeys = ["id", "name", "age", "schoolLevel", "gallery", "galleryLabel", "shortDescription", "portraitId", "portraitAlt", "sections"];
    if (Object.keys(biography).some((key) => !allowedKeys.includes(key))) fail(`${biography.id} contient un champ non autorisé`);
    if (biography.portraitId !== biography.id || !biography.portraitAlt || !biography.shortDescription) fail(`${biography.id} jointure publique incomplète`);
    if (!Array.isArray(biography.sections) || biography.sections.length !== 13) fail(`${biography.id} doit contenir 13 rubriques`);
    biography.sections.forEach((section, index) => {
      if (section.number !== index + 1 || section.number > 13) fail(`${biography.id} rubrique ${index + 1} incorrecte`);
      if (!expectedTitles[section.number]?.includes(section.title)) fail(`${biography.id}/${section.number} titre canonique inattendu : ${section.title}`);
      if (!section.title || !Array.isArray(section.blocks) || section.blocks.length === 0) fail(`${biography.id}/${section.number} vide`);
      const allowedBlockTypes = new Set(["paragraph", "list", "timeline", "disclosure-map"]);
      if (section.blocks.some(({ type }) => !allowedBlockTypes.has(type))) fail(`${biography.id}/${section.number} type de bloc interdit`);
    });
  }
  const serialized = JSON.stringify(data);
  for (const forbidden of FORBIDDEN_PUBLIC_BIOGRAPHY_STRINGS) if (serialized.includes(forbidden)) fail(`chaîne interdite trouvée : ${forbidden}`);
  for (const forbiddenKey of ["trainer", "situations", "matrix", "feedbacks", "dangerouslySetInnerHTML"]) if (serialized.includes(`"${forbiddenKey}"`)) fail(`champ interdit trouvé : ${forbiddenKey}`);
  const homonyms = [["P01", "XP08"], ["P02", "XP05"], ["P05", "XP06"], ["P08", "XP07"]];
  for (const [left, right] of homonyms) {
    const first = data.biographies.find(({ id }) => id === left);
    const second = data.biographies.find(({ id }) => id === right);
    if (!first || !second || first.name !== second.name || first.portraitId === second.portraitId || first.portraitAlt === second.portraitAlt) fail(`homonymes fusionnés : ${left}/${right}`);
  }
  return { biographyCount: 17, generalCount: 9, intersectionalCount: 8, sectionCount: 221 };
}

function main() {
  try {
    const summary = validatePublicBiographiesV2(parsePublicBiographiesV2());
    console.log("Validation des biographies publiques réussie");
    console.log(`Biographies : ${summary.biographyCount} (${summary.generalCount} P, ${summary.intersectionalCount} XP)`);
    console.log(`Rubriques publiques : ${summary.sectionCount}`);
  } catch (cause) {
    console.error(cause instanceof Error ? cause.message : String(cause));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
