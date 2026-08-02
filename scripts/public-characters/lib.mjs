import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const OUTPUT = path.join(ROOT, "src/data/public/publicJourneyWords.generated.ts");

export const EXPECTED_WORD_IDS = [
  "MU-ORI", "MU-ASE", "MU-ARO", "MU-IDG", "MU-EXG", "MU-CSX", "MU-SAN", "MU-PRO",
  "MU-CIN", "MU-COU", "MU-OUT", "MU-TRA", "MU-NBI", "MU-INT", "MU-CONF",
];

function documentsRoot() {
  const candidates = [process.env.MOSAIQUE_IMPORT_DIR, path.resolve(ROOT, "../mosaique-import")].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Sources éditoriales introuvables. Définir MOSAIQUE_IMPORT_DIR ou placer mosaique-import à côté du dépôt.");
  return found;
}

function readRequired(filename) {
  if (!existsSync(filename)) throw new Error(`Source requise absente : ${filename}`);
  return readFileSync(filename, "utf8").replace(/\r\n/g, "\n");
}

export function buildPublicJourneyWords() {
  const docs = documentsRoot();
  const wordsPath = path.join(docs, "public-lyceen/conception/091_Mosaique_Public_lyceen_Les_mots_utiles_V2.md");
  const registerPath = path.join(docs, "public-lyceen/conception/092_Mosaique_Public_lyceen_Registre_sources_renvois_et_tracabilite_V2.md");
  const wordsSource = readRequired(wordsPath);
  const registerSource = readRequired(registerPath);
  const subtitle = wordsSource.match(/sous-titrée\s*:\s*\n\n> ([^\n]+)/)?.[1]?.trim();
  const section = wordsSource.match(/^# Mots et parcours\n([\s\S]*?)(?=^# Autres mots utiles$)/m)?.[1];
  if (!subtitle || !section) throw new Error("091 V2 : vue Mots et parcours incomplète");
  const words = [...section.matchAll(/^## (MU-[A-Z]+) — (.+)$/gm)].map((match) => ({
    id: match[1],
    label: match[2].trim(),
    target: `#/mots-utiles/${match[1].toLowerCase()}`,
    status: "deferred",
  }));
  if (words.map(({ id }) => id).join(",") !== EXPECTED_WORD_IDS.join(",")) throw new Error("091 V2 : les 15 entrées Mots et parcours sont absentes ou mal ordonnées");
  for (const id of EXPECTED_WORD_IDS) {
    if (!new RegExp(`^\\| ${id.replace("-", "\\-")} \\|`, "m").test(registerSource)) throw new Error(`092 V2 : entrée de contrôle absente pour ${id}`);
  }
  return { title: "Mots et parcours", subtitle, words };
}

export function generatedSource(data) {
  return `// Fichier généré. Ne pas modifier manuellement.\nimport type { PublicJourneyWord } from "./publicCharacters.types";\n\nexport const publicJourneyWordsTitle = ${JSON.stringify(data.title)};\nexport const publicJourneyWordsSubtitle = ${JSON.stringify(data.subtitle)};\nexport const publicJourneyWords = ${JSON.stringify(data.words, null, 2)} as const satisfies readonly PublicJourneyWord[];\n`;
}
