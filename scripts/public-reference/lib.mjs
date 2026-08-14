import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const REPERES_OUTPUT = path.join(ROOT, "src/data/public/publicReperes.generated.json");
export const WORDS_OUTPUT = path.join(ROOT, "src/data/public/publicUsefulWords.generated.json");
export const JOURNEY_OUTPUT = path.join(ROOT, "src/data/public/publicJourneyWords.generated.ts");

const EXPECTED_REPERES = ["R1", "R2", "R3", "R4", "R5"];
export const JOURNEY_IDS = ["MU-ORI", "MU-ASE", "MU-ARO", "MU-IDG", "MU-EXG", "MU-CSX", "MU-SAN", "MU-PRO", "MU-CIN", "MU-COU", "MU-OUT", "MU-TRA", "MU-NBI", "MU-INT", "MU-CONF"];

function documentsRoot() {
  const candidates = [process.env.MOSAIQUE_IMPORT_DIR, path.resolve(ROOT, "../mosaique-import")].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Sources éditoriales introuvables. Définir MOSAIQUE_IMPORT_DIR ou placer mosaique-import à côté du dépôt.");
  return found;
}

function sourcePaths() {
  const docs = documentsRoot();
  return {
    reperes: path.join(docs, "public-lyceen/conception/090_Mosaique_Public_lyceen_Pages_Reperes_et_microcontenus_Jouer_V3.md"),
    words: path.join(docs, "public-lyceen/conception/091_Mosaique_Public_lyceen_Les_mots_utiles_V2.md"),
    register: path.join(docs, "public-lyceen/conception/092_Mosaique_Public_lyceen_Registre_sources_renvois_et_tracabilite_V2.md"),
  };
}

const readRequired = (filename) => {
  if (!existsSync(filename)) throw new Error(`Source requise absente : ${filename}`);
  return readFileSync(filename, "utf8").replace(/\r\n/g, "\n");
};
const normalize = (value) => value.trim().replace(/[ \t]+$/gm, "");
const strip = (value) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");

function parseBlocks(markdown) {
  const parts = normalize(markdown).split(/\n\s*\n/).filter(Boolean);
  return parts.map((part) => {
    if (part.startsWith("> ")) {
      const clean = part.replace(/^> ?/gm, "");
      const label = clean.match(/^\*\*([^*]+)\*\*[ \t]*\n?/)?.[1];
      const text = clean.replace(/^\*\*[^*]+\*\*[ \t]*\n?/, "").replace(/ {2}\n/g, "\n");
      return { type: "callout", label, text };
    }
    if (part.split("\n").every((line) => /^- /.test(line))) return { type: "list", items: part.split("\n").map((line) => line.slice(2)) };
    return { type: "paragraph", text: part.replace(/ {2}\n/g, "\n") };
  });
}

function continuationTarget(label) {
  const routes = { Jouer: "#/jouer", Personnages: "#/personnages", Situations: "#/situations", Repères: "#/reperes" };
  return routes[label];
}

function wordCatalog(markdown) {
  return new Map([...markdown.matchAll(/^## (MU-[A-Z]+) — (.+)$/gm)].map((match) => [match[2].trim().toLocaleLowerCase("fr"), { id: match[1], label: match[2].trim() }]));
}

function parseReperes(markdown, wordsMarkdown) {
  const headings = [...markdown.matchAll(/^# (R[1-5]) — (.+)$/gm)];
  if (headings.length !== 5) throw new Error(`090 V3 : cinq Repères attendus, ${headings.length} trouvés`);
  const catalog = wordCatalog(wordsMarkdown);
  return headings.map((heading, index) => {
    const end = headings[index + 1]?.index ?? markdown.indexOf("\n# Microcontenus", heading.index);
    const body = markdown.slice(heading.index + heading[0].length, end).trim();
    const sectionHeadings = [...body.matchAll(/^## (.+)$/gm)];
    const firstSection = sectionHeadings[0]?.index ?? body.length;
    const prelude = body.slice(0, firstSection).trim();
    const introduction = prelude.split(/\n\s*\n/)[0]?.trim();
    const inBrief = prelude.match(/> \*\*En bref\*\*[ \t]*\n> ([\s\S]*)$/m)?.[1]?.replace(/^> ?/gm, "").replace(/ {2}\n/g, "\n").trim();
    if (!introduction || !inBrief) throw new Error(`${heading[1]} : introduction ou En bref absent`);
    const sections = sectionHeadings.map((section, sectionIndex) => {
      const sectionEnd = sectionHeadings[sectionIndex + 1]?.index ?? body.length;
      return { title: section[1].trim(), blocks: parseBlocks(body.slice(section.index + section[0].length, sectionEnd)) };
    });
    const allBlocks = sections.flatMap(({ blocks }) => blocks);
    const continuationBlock = allBlocks.find((block) => block.type === "paragraph" && block.text?.startsWith("**Pour continuer :**"));
    const usefulBlock = allBlocks.find((block) => block.type === "paragraph" && block.text?.startsWith("**Mots utiles :**"));
    if (!continuationBlock?.text || !usefulBlock?.text) throw new Error(`${heading[1]} : renvoi final ou mots utiles absent`);
    const continueLinks = [...continuationBlock.text.matchAll(/\*\*([^*]+)\*\*/g)].slice(1).map((match) => ({ label: match[1], target: continuationTarget(match[1]) })).filter(({ target }) => target);
    const usefulWords = usefulBlock.text.replace(/^\*\*Mots utiles :\*\* /, "").replace(/\.$/, "").split(/\s*;\s*/).map((label) => {
      const word = catalog.get(label.toLocaleLowerCase("fr"));
      if (!word) throw new Error(`${heading[1]} : mot utile inconnu ${label}`);
      return { ...word, target: `#/mots-utiles/${word.id.toLowerCase()}?from=${heading[1].toLowerCase()}` };
    });
    return {
      id: heading[1], routeSegment: heading[1].toLowerCase(), title: heading[2].trim(), introduction: strip(introduction), inBrief: strip(inBrief),
      sections: sections.map((section) => ({ ...section, blocks: section.blocks.filter((block) => block !== continuationBlock && block !== usefulBlock) })),
      continueText: normalize(continuationBlock.text), continueLinks, usefulWords,
    };
  });
}

function labeled(block, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return block.match(new RegExp(`^\\*\\*${escaped} :\\*\\* (.+)$`, "m"))?.[1]?.trim();
}

function parseWords(markdown) {
  const headings = [...markdown.matchAll(/^## (MU-[A-Z]+) — (.+)$/gm)];
  if (headings.length !== 25) throw new Error(`091 V2 : 25 termes attendus, ${headings.length} trouvés`);
  return headings.map((heading, index) => {
    const end = headings[index + 1]?.index ?? markdown.indexOf("\n---", heading.index);
    const block = markdown.slice(heading.index + heading[0].length, end).trim();
    const field = (label) => labeled(block, label) ?? (() => { throw new Error(`${heading[1]} : champ ${label} absent`); })();
    const sourcesBlock = block.match(/^\*\*Sources publiques :\*\*([\s\S]*)$/m)?.[1]?.trim() ?? "";
    const publicSources = sourcesBlock.startsWith("-") ? sourcesBlock.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2)) : [];
    const relatedRepereIds = [...sourcesBlock.matchAll(/\bR[1-5]\b/g)].map((match) => match[0]);
    return {
      id: heading[1], routeSegment: heading[1].toLowerCase(), label: heading[2].trim(), term: field("Terme"), isJourneyWord: index < 15,
      inBrief: field("En bref"), example: field("Exemple"), notConfuse: field("À ne pas confondre"), remember: field("À retenir"),
      usageSpaces: field("Espaces d’utilisation").replace(/\.$/, "").split(/\s*;\s*/), datedNote: field("Contenu daté"), publicSources, relatedRepereIds,
    };
  });
}

export function buildPublicReference() {
  const paths = sourcePaths();
  const reperesSource = readRequired(paths.reperes);
  const wordsSource = readRequired(paths.words);
  const register = readRequired(paths.register);
  const reperes = parseReperes(reperesSource, wordsSource);
  const words = parseWords(wordsSource);
  if (reperes.map(({ id }) => id).join() !== EXPECTED_REPERES.join()) throw new Error("090 V3 : ordre R1–R5 invalide");
  if (words.slice(0, 15).map(({ id }) => id).join() !== JOURNEY_IDS.join()) throw new Error("091 V2 : groupe Mots et parcours invalide");
  for (const id of [...EXPECTED_REPERES, ...words.map(({ id }) => id)]) if (!register.includes(id)) throw new Error(`092 V2 : identifiant de contrôle absent ${id}`);
  return { reperes, words };
}

export function generatedReperes(data) { return `${JSON.stringify({ generatedNotice: "Fichier généré. Ne pas modifier manuellement.", reperes: data.reperes }, null, 2)}\n`; }
export function generatedWords(data) { return `${JSON.stringify({ generatedNotice: "Fichier généré. Ne pas modifier manuellement.", words: data.words }, null, 2)}\n`; }
export function generatedJourney(data) {
  const words = data.words.slice(0, 15).map(({ id, label }) => ({ id, label, target: `#/mots-utiles/${id.toLowerCase()}?from=parcours`, status: "active" }));
  return `// Fichier généré. Ne pas modifier manuellement.\nimport type { PublicJourneyWord } from "./publicCharacters.types";\n\nexport const publicJourneyWordsTitle = "Mots et parcours";\nexport const publicJourneyWordsSubtitle = "Comprendre les mots utilisés dans les biographies";\nexport const publicJourneyWords = ${JSON.stringify(words, null, 2)} as const satisfies readonly PublicJourneyWord[];\n`;
}
