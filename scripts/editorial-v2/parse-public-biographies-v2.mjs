import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./editorial-config.mjs";

export const PUBLIC_BIOGRAPHY_IDS = [
  "P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09",
  "XP01", "XP02", "XP03", "XP04", "XP05", "XP06", "XP07", "XP08",
];

export const PUBLIC_BIOGRAPHY_FILES = {
  canonical: "docs/editorial-v2/biographies/046_Biographies_approfondies_17_personnages_V1.md",
  specification: "docs/editorial-v2/biographies/047_Specification_fiches_biographiques_publiques_V2.md",
  matrix: "docs/editorial-v2/biographies/048_Matrice_affichage_17_biographies_V2.md",
  alternatives: "docs/illustrations/074_Cahier_textes_alternatifs_portraits_personnages_Mosaique_V2.md",
  generalGallery: "src/data/generated-v2/galleries/general.json",
  intersectionalGallery: "src/data/generated-v2/galleries/intersectional.json",
};

const EXPECTED_STATUS = new Map([
  [PUBLIC_BIOGRAPHY_FILES.specification, "spécification validée, prête pour intégration fonctionnelle"],
  [PUBLIC_BIOGRAPHY_FILES.matrix, "matrice de contrôle validée, prête pour intégration fonctionnelle"],
  [PUBLIC_BIOGRAPHY_FILES.alternatives, "textes alternatifs validés, prêts pour intégration fonctionnelle"],
]);

function fail(location, message) {
  throw new Error(`Biographies publiques — ${location} : ${message}`);
}

const read = (relativePath) => readFileSync(join(ROOT, relativePath), "utf8");

function validateDocumentMetadata(relativePath, markdown) {
  if (!/^# Mosaïque — /m.test(markdown)) fail(relativePath, "titre Mosaïque absent");
  if (!/^- \*\*Version :\*\* 2\.0$/m.test(markdown)) fail(relativePath, "version 2.0 absente");
  const status = EXPECTED_STATUS.get(relativePath);
  if (status && !markdown.includes(`- **Statut :** ${status}`)) fail(relativePath, `statut inattendu`);
}

function parseInline(value) {
  const text = value.trim();
  const segments = [];
  let cursor = 0;
  for (const match of text.matchAll(/\*\*([^*]+)\*\*/g)) {
    if (match.index > cursor) segments.push({ text: text.slice(cursor, match.index) });
    segments.push({ text: match[1], emphasis: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments.length > 0 ? segments : [{ text: "" }];
}

function linesToText(lines) {
  return lines.map((line) => line.trim()).filter(Boolean).join(" ");
}

function parseTable(lines, location) {
  if (lines.length < 3 || !/^\|(?:\s*:?-+:?\s*\|)+$/.test(lines[1])) fail(location, "tableau Markdown illisible");
  const cells = (line) => line.slice(1, -1).split("|").map((cell) => cell.trim());
  const headers = cells(lines[0]);
  if (headers.length !== 2) fail(location, "cartographie à deux colonnes attendue");
  return lines.slice(2).map((line, index) => {
    const row = cells(line);
    if (row.length !== 2 || row.some((cell) => !cell)) fail(`${location}/ligne ${index + 1}`, "cellule vide ou nombre de colonnes incorrect");
    return { group: row[0], currentSituation: row[1] };
  });
}

function parseBlocks(markdown, sectionNumber, location) {
  const lines = markdown.trim().split(/\r?\n/);
  const blocks = [];
  for (let index = 0; index < lines.length;) {
    if (!lines[index].trim()) { index += 1; continue; }
    if (lines[index].startsWith("|")) {
      const table = [];
      while (index < lines.length && lines[index].startsWith("|")) table.push(lines[index++]);
      if (sectionNumber !== 6) fail(location, "tableau autorisé uniquement dans la cartographie");
      blocks.push({ type: "disclosure-map", entries: parseTable(table, location) });
      continue;
    }
    if (lines[index].startsWith("- ")) {
      const items = [];
      while (index < lines.length && (lines[index].startsWith("- ") || /^\s{2,}\S/.test(lines[index]))) {
        if (lines[index].startsWith("- ")) items.push(lines[index].slice(2).trim());
        else items[items.length - 1] += ` ${lines[index].trim()}`;
        index += 1;
      }
      if (sectionNumber === 4) {
        const entries = items.map((item, itemIndex) => {
          const match = item.match(/^\*\*(.+?)\s*:\*\*\s*(.+)$/);
          if (!match) fail(`${location}/chronologie ${itemIndex + 1}`, "repère en emphase suivi de deux-points attendu");
          return { period: match[1], content: parseInline(match[2]) };
        });
        if (entries.length === 0) fail(location, "chronologie vide");
        blocks.push({ type: "timeline", entries });
      } else {
        blocks.push({ type: "list", items: items.map(parseInline) });
      }
      continue;
    }
    const paragraph = [];
    while (index < lines.length && lines[index].trim() && !lines[index].startsWith("- ") && !lines[index].startsWith("|")) paragraph.push(lines[index++]);
    blocks.push({ type: "paragraph", content: parseInline(linesToText(paragraph)) });
  }
  if (blocks.length === 0) fail(location, "contenu vide");
  if (sectionNumber === 4 && !blocks.some(({ type }) => type === "timeline")) fail(location, "chronologie absente");
  if (sectionNumber === 6 && !blocks.some(({ type }) => type === "disclosure-map")) fail(location, "cartographie absente");
  return blocks;
}

function parseAlternatives(markdown) {
  validateDocumentMetadata(PUBLIC_BIOGRAPHY_FILES.alternatives, markdown);
  const rows = [...markdown.matchAll(/^\| (P\d{2}|XP\d{2}) \| ([^|]+) \| ([^|]+) \| `([^`]+)` \| ([^|]+) \|$/gm)];
  if (rows.length !== 17) fail("074", `17 textes alternatifs attendus, ${rows.length} trouvés`);
  const alternatives = new Map();
  for (const row of rows) {
    const [, id, name, galleryLabel, filename, portraitAlt] = row;
    if (alternatives.has(id)) fail("074", `identifiant dupliqué ${id}`);
    alternatives.set(id, { name: name.trim(), galleryLabel: galleryLabel.trim(), filename, portraitAlt: portraitAlt.trim() });
  }
  return alternatives;
}

function parseCatalogues() {
  const general = JSON.parse(read(PUBLIC_BIOGRAPHY_FILES.generalGallery));
  const intersectional = JSON.parse(read(PUBLIC_BIOGRAPHY_FILES.intersectionalGallery));
  return new Map([
    ...general.characters.map((item) => [item.id, { ...item, gallery: "general", shortDescription: item.presentation }]),
    ...intersectional.characters.map((item) => [item.id, { ...item, gallery: "intersectional", shortDescription: item.profile }]),
  ]);
}

function portraitRelativePath(id) {
  return id.startsWith("XP")
    ? `src/assets/illustrations/characters/intersectional/${id.toLowerCase()}.webp`
    : `src/assets/illustrations/characters/general/${id.toLowerCase()}.webp`;
}

function parseCanonical(markdown, alternatives, catalogues) {
  const biographyRoot = markdown.match(/^## C\. Les 17 biographies\s*$([\s\S]+)$/m)?.[1];
  if (!biographyRoot) fail("046", "section canonique C absente");
  const matches = [...biographyRoot.matchAll(/^#### (P\d{2}|XP\d{2}) — (.+)$/gm)];
  if (matches.length !== 17) fail("046", `17 personnages attendus, ${matches.length} trouvés`);
  const biographies = matches.map((match, index) => {
    const id = match[1];
    if (id !== PUBLIC_BIOGRAPHY_IDS[index]) fail("046", `ordre incorrect : ${id} à la position ${index + 1}`);
    const body = biographyRoot.slice(match.index, matches[index + 1]?.index ?? biographyRoot.length);
    const accessible = body.indexOf("##### Fiche approfondie accessible");
    const trainer = body.indexOf("##### Volet réservé au formateur");
    if (accessible < 0 || trainer < 0 || trainer <= accessible) fail(`046/${id}`, "frontière accessible/formateur absente ou incorrecte");
    const publicBody = body.slice(accessible, trainer);
    if (/^###### 1[4-7]\./m.test(publicBody)) fail(`046/${id}`, "rubrique formateur extraite");
    const sections = [...publicBody.matchAll(/^###### (\d+)\. (.+)$/gm)].map((sectionMatch, sectionIndex, sectionMatches) => {
      const number = Number(sectionMatch[1]);
      const contentStart = sectionMatch.index + sectionMatch[0].length;
      const contentEnd = sectionMatches[sectionIndex + 1]?.index ?? publicBody.length;
      return { number, title: sectionMatch[2].trim(), blocks: parseBlocks(publicBody.slice(contentStart, contentEnd), number, `046/${id}/${number}`) };
    });
    if (sections.length !== 13 || sections.some(({ number }, sectionIndex) => number !== sectionIndex + 1)) fail(`046/${id}`, "rubriques 1 à 13 uniques et ordonnées attendues");
    const catalogue = catalogues.get(id);
    const alternative = alternatives.get(id);
    if (!catalogue || !catalogue.shortDescription) fail(id, "description courte actuelle absente");
    if (!alternative) fail(id, "texte alternatif validé absent");
    if (catalogue.name !== match[2].trim() || alternative.name !== catalogue.name) fail(id, "prénom incohérent entre les sources");
    const portraitPath = portraitRelativePath(id);
    if (!existsSync(join(ROOT, portraitPath))) fail(id, `portrait absent : ${portraitPath}`);
    if (alternative.filename !== `${id.toLowerCase()}.webp`) fail(id, `fichier 074 incohérent : ${alternative.filename}`);
    const galleryLabel = catalogue.gallery === "general" ? "Galerie générale" : "Galerie Intersectionnalités";
    if (alternative.galleryLabel !== galleryLabel) fail(id, "galerie 074 incohérente");
    return {
      id,
      name: catalogue.name,
      age: catalogue.age,
      schoolLevel: catalogue.schoolLevel,
      gallery: catalogue.gallery,
      galleryLabel,
      shortDescription: catalogue.shortDescription,
      portraitId: id,
      portraitAlt: alternative.portraitAlt,
      sections,
    };
  });
  if (new Set(biographies.map(({ id }) => id)).size !== 17) fail("046", "identifiant dupliqué");
  return biographies;
}

export function parsePublicBiographiesV2() {
  const specification = read(PUBLIC_BIOGRAPHY_FILES.specification);
  const matrix = read(PUBLIC_BIOGRAPHY_FILES.matrix);
  validateDocumentMetadata(PUBLIC_BIOGRAPHY_FILES.specification, specification);
  validateDocumentMetadata(PUBLIC_BIOGRAPHY_FILES.matrix, matrix);
  const alternatives = parseAlternatives(read(PUBLIC_BIOGRAPHY_FILES.alternatives));
  const biographies = parseCanonical(read(PUBLIC_BIOGRAPHY_FILES.canonical), alternatives, parseCatalogues());
  return { schemaVersion: 1, sourceFile: PUBLIC_BIOGRAPHY_FILES.canonical, biographies };
}
