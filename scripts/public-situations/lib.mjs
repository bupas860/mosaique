import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const OUTPUT = path.join(ROOT, "src/data/public/publicSituations.generated.ts");

const expectedCodes = [
  ...Array.from({ length: 16 }, (_, index) => `V${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 13 }, (_, index) => `N${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 16 }, (_, index) => `I${String(index + 1).padStart(2, "0")}`),
  ...Array.from({ length: 16 }, (_, index) => `X${String(index + 1).padStart(2, "0")}`),
];

const focalConfig = {
  V: { id: "V", label: "Obstacles visibles", slug: "obstacles-visibles" },
  N: { id: "N", label: "Normes ordinaires", slug: "normes-ordinaires" },
  I: { id: "I", label: "Effets invisibles", slug: "effets-invisibles" },
  X: { id: "X", label: "Intersectionnalités", slug: "intersectionnalites" },
};

function documentsRoot() {
  const candidates = [
    process.env.MOSAIQUE_IMPORT_DIR,
    path.resolve(ROOT, "../mosaique-import"),
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error("Sources éditoriales introuvables. Définir MOSAIQUE_IMPORT_DIR ou placer mosaique-import à côté du dépôt.");
  return found;
}

function sourcePaths() {
  const docs = documentsRoot();
  return {
    corpus: path.join(docs, "public-lyceen/situations/139_Mosaique_Public_lyceen_Corpus_consolide_61_situations_V2.md"),
    register: path.join(docs, "public-lyceen/situations/140_Mosaique_Public_lyceen_Registre_consolide_61_situations_V2.md"),
    words: path.join(docs, "public-lyceen/conception/091_Mosaique_Public_lyceen_Les_mots_utiles_V2.md"),
    alts: path.join(docs, "073_Cahier_textes_alternatifs_illustrations_Mosaique_V1.md"),
    banks: {
      V: path.join(docs, "biographies-personnages/100_Mode_Obstacles_visibles_V1.md"),
      N: path.join(docs, "biographies-personnages/110_Mode_Normes_ordinaires_V1.md"),
      I: path.join(docs, "biographies-personnages/120_Mode_Effets_invisibles_V1.md"),
      X: path.join(docs, "biographies-personnages/130_Mode_Intersectionnalites_V1.md"),
    },
  };
}

const readRequired = (filename) => {
  if (!existsSync(filename)) throw new Error(`Source requise absente : ${filename}`);
  return readFileSync(filename, "utf8").replace(/\r\n/g, "\n");
};

const normalizeText = (value) => value.trim().replace(/[ \t]+$/gm, "");
const stripInlineMarkdown = (value) => value
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/`([^`]+)`/g, "$1");
const paragraphs = (value) => normalizeText(value).split(/\n\s*\n/).map((part) => stripInlineMarkdown(part.trim())).filter(Boolean);
const section = (block, title) => {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return block.match(new RegExp(`^### ${escaped}\\n\\n([\\s\\S]*?)(?=\\n### |\\n---|(?![\\s\\S]))`, "m"))?.[1]?.trim() ?? "";
};

function parseWordCatalog(markdown) {
  return new Map([...markdown.matchAll(/^## (MU-[A-Z]+) — (.+)$/gm)].map((match) => [match[1], match[2].trim()]));
}

function parseAltCatalog(markdown) {
  const headings = [...markdown.matchAll(/^### ([VNIX]\d{2}) — .+$/gm)];
  return new Map(headings.map((heading, index) => {
    const end = headings[index + 1]?.index ?? markdown.length;
    const block = markdown.slice(heading.index, end);
    const alt = block.match(/^- \*\*Texte alternatif retenu :\*\* (.+)$/m)?.[1]?.trim();
    const illustrationFile = block.match(/^- \*\*Export WebP :\*\* `([^`]+)`$/m)?.[1];
    if (!alt || !illustrationFile) throw new Error(`${heading[1]} : texte alternatif ou WebP absent dans 073`);
    return [heading[1], { alt, illustrationFile }];
  }));
}

function parseCanonicalBank(markdown) {
  const headings = [...markdown.matchAll(/^### ([VNIX]\d{2}) — .+$/gm)];
  return new Map(headings.map((heading, index) => {
    const end = headings[index + 1]?.index ?? markdown.length;
    const block = markdown.slice(heading.index, end);
    const text = block.match(/^#### Texte affiché au joueur\n\n([\s\S]*?)(?=\n\n\*\*Question :)/m)?.[1];
    if (!text) throw new Error(`${heading[1]} : texte joueur absent de la banque canonique`);
    return [heading[1], normalizeText(text)];
  }));
}

function parseRegister(markdown) {
  const rows = markdown.split("\n").filter((line) => /^\| [VNIX]\d{2} \|/.test(line));
  const result = new Map();
  for (const line of rows) {
    const columns = line.slice(1, -1).split("|").map((value) => value.trim());
    if (columns.length !== 15) continue;
    const [code, title, focalLabel, role, , , , , illustrationFile, , usefulWords, continueText] = columns;
    result.set(code, {
      title,
      focalLabel,
      role,
      illustrationFile: illustrationFile.replaceAll("`", ""),
      usefulWordIds: usefulWords.split(/\s*;\s*/),
      continueText,
    });
  }
  return result;
}

function parseContinue(raw, focal) {
  const link = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (!link) throw new Error("Renvoi final sans destination structurée");
  const linkStart = link.index;
  const prefix = raw.slice(0, linkStart);
  const suffix = raw.slice(linkStart + link[0].length);
  const targetCode = link[1].match(/\b([VNIX]\d{2})\b/)?.[1];
  if (targetCode) return { prefix, label: link[1], suffix, type: "situation", target: targetCode, status: "active" };
  const focalMatch = link[2].match(/#foc-([vnix])--/i);
  if (focalMatch) {
    const targetFocal = focalConfig[focalMatch[1].toUpperCase()];
    return { prefix, label: link[1], suffix, type: "focal", target: targetFocal.slug, status: "active" };
  }
  throw new Error(`Renvoi final non reconnu pour la focale ${focal.label} : ${link[2]}`);
}

function parseFocal(markdown, focal, sectionStart, sectionEnd) {
  const block = markdown.slice(sectionStart, sectionEnd);
  const focalHeading = block.match(new RegExp(`^### FOC-${focal.id} — ${focal.label}$`, "m"));
  if (!focalHeading) throw new Error(`Introduction de focale absente : ${focal.label}`);
  const afterHeading = block.slice(focalHeading.index + focalHeading[0].length).trimStart();
  const lead = afterHeading.match(/^([\s\S]*?)(?=\n\n> \*\*En bref\*\*)/)?.[1]?.trim();
  const inBrief = block.match(/> \*\*En bref\*\*[ \t]*\n> ([\s\S]*?)(?=\n\n### Comment)/)?.[1]?.replace(/^> ?/gm, "").trim();
  const recognize = block.match(/^### Comment la reconnaître \?\n\n([\s\S]*?)(?=\n\n### Exemple)/m)?.[1];
  const example = block.match(/^### Exemple : (.+)\n\n([\s\S]*?)(?=\n\n> \*\*À ne pas confondre\*\*)/m);
  const notConfuse = block.match(/> \*\*À ne pas confondre\*\*[ \t]*\n> ([\s\S]*?)(?=\n\n> \*\*À retenir\*\*)/)?.[1]?.replace(/^> ?/gm, "").trim();
  const remember = block.match(/> \*\*À retenir\*\*[ \t]*\n> ([\s\S]*?)(?=\n\n\*\*Mots utiles)/)?.[1]?.replace(/^> ?/gm, "").trim();
  if (!lead || !inBrief || !recognize || !example || !notConfuse || !remember) throw new Error(`Introduction structurée incomplète : ${focal.label}`);
  return {
    ...focal,
    lead: stripInlineMarkdown(lead),
    inBrief: stripInlineMarkdown(inBrief),
    recognize: paragraphs(recognize),
    exampleTitle: stripInlineMarkdown(example[1]),
    example: paragraphs(example[2]),
    notConfuse: stripInlineMarkdown(notConfuse),
    remember: stripInlineMarkdown(remember),
  };
}

export function buildPublicSituations() {
  const paths = sourcePaths();
  const corpus = readRequired(paths.corpus);
  const presentationBlock = corpus.match(/^## Présentation\n\n([\s\S]*?)(?=\n\n---)/m)?.[1];
  if (!presentationBlock) throw new Error("139 V2 : présentation générale absente");
  const presentationParts = presentationBlock.split(/\n\n/);
  const introduction = {
    paragraphs: presentationParts.slice(0, 2).map(stripInlineMarkdown),
    warningTitle: presentationBlock.match(/> \*\*([^*]+)\*\*/)?.[1]?.trim() ?? "",
    warning: presentationBlock.match(/> \*\*[^*]+\*\*[ \t]*\n> ([\s\S]*)$/)?.[1]?.replace(/^> ?/gm, "").trim() ?? "",
  };
  const register = parseRegister(readRequired(paths.register));
  const wordCatalog = parseWordCatalog(readRequired(paths.words));
  const altCatalog = parseAltCatalog(readRequired(paths.alts));
  const canonical = new Map([...Object.values(paths.banks).flatMap((filename) => [...parseCanonicalBank(readRequired(filename))])]);
  const codeHeadings = [...corpus.matchAll(/^#### ([VNIX]\d{2}) — (.+)$/gm)];
  if (codeHeadings.length !== 61) throw new Error(`139 V2 : 61 fiches attendues, ${codeHeadings.length} trouvées`);

  const situations = codeHeadings.map((heading) => {
    const code = heading[1];
    const title = heading[2].trim();
    const blockStart = corpus.lastIndexOf("\n### Illustration", heading.index);
    const separator = corpus.indexOf("\n---", heading.index);
    const block = corpus.slice(blockStart, separator < 0 ? corpus.length : separator);
    const focal = focalConfig[code[0]];
    const illustrationFile = block.match(/\*\*Export WebP existant :\*\* `([^`]+)`/)?.[1];
    const altText = block.match(/\*\*Texte alternatif existant :\*\* (.+)$/m)?.[1]?.trim();
    const focalLabel = block.match(/\*\*Focale principale retenue par Mosaïque :\*\* (.+)$/m)?.[1]?.trim();
    const role = block.match(/\*\*Rôle de la scène :\*\* (obstacle|protection)$/m)?.[1];
    const canonicalRaw = section(block, "La situation présentée dans le jeu");
    const canonicalText = normalizeText(canonicalRaw.replace(/^> ?/gm, ""));
    const protectionHeading = block.includes("### Ce que cette protection change") ? "Ce que cette protection change" : "Ce qui pourrait protéger";
    const wordRaw = section(block, "Mots utiles");
    const usefulWords = [...wordRaw.matchAll(/\[(MU-[A-Z]+) — ([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({ id: match[1], label: match[2], target: `#/mots-utiles/${match[1].toLowerCase()}` }));
    const continueRaw = section(block, "Continuer");
    const continued = parseContinue(continueRaw, focal);
    const registry = register.get(code);
    const altRegistry = altCatalog.get(code);
    const canonicalExpected = canonical.get(code);
    if (!registry || !altRegistry || !canonicalExpected) throw new Error(`${code} : source de contrôle absente`);
    const compare = (field, observed, expected, source) => {
      if (observed !== expected) throw new Error(`${code} — ${field} — source ${source} — attendu ${JSON.stringify(expected)}, observé ${JSON.stringify(observed)}`);
    };
    compare("titre", title, registry.title, "140 V2");
    compare("focale", focalLabel, registry.focalLabel, "140 V2");
    compare("rôle", role, registry.role, "140 V2");
    compare("illustration", illustrationFile, registry.illustrationFile, "140 V2");
    compare("illustration", illustrationFile, altRegistry.illustrationFile, "073");
    compare("texte alternatif", altText, altRegistry.alt, "073");
    compare("texte joueur", canonicalText, canonicalExpected, `banque ${code[0]}00/10/20/30`);
    compare("mots utiles", usefulWords.map(({ id }) => id).join(";"), registry.usefulWordIds.join(";"), "140 V2");
    compare("renvoi", stripInlineMarkdown(continueRaw), stripInlineMarkdown(registry.continueText), "140 V2");
    for (const word of usefulWords) {
      const catalogLabel = wordCatalog.get(word.id);
      if (!catalogLabel || word.label.toLocaleLowerCase("fr") !== catalogLabel.toLocaleLowerCase("fr")) compare(`mot utile ${word.id}`, word.label, catalogLabel, "091 V2");
    }
    const imagePath = path.join(ROOT, "src/assets/illustrations/situations", illustrationFile);
    if (!existsSync(imagePath) || statSync(imagePath).size === 0) throw new Error(`${code} — illustration absente : ${illustrationFile}`);
    return {
      code,
      title,
      focalId: focal.id,
      focalLabel: focal.label,
      focalSlug: focal.slug,
      role,
      illustrationFile,
      altText,
      canonicalText,
      observe: paragraphs(section(block, "Ce qu’il faut observer")),
      focalAnalysis: paragraphs(section(block, "La focale principale de Mosaïque")),
      whyItMatters: paragraphs(section(block, "Pourquoi cela peut compter")),
      protectionHeading,
      protectiveContent: paragraphs(section(block, protectionHeading)),
      otherReading: paragraphs(section(block, "Une autre lecture possible")),
      usefulWords,
      continueTarget: continued,
    };
  });

  const sectionStarts = [...corpus.matchAll(/^## [1-4]\. (Obstacles visibles|Normes ordinaires|Effets invisibles|Intersectionnalités)$/gm)];
  const focals = sectionStarts.map((match, index) => {
    const focal = Object.values(focalConfig).find(({ label }) => label === match[1]);
    return parseFocal(corpus, focal, match.index, sectionStarts[index + 1]?.index ?? corpus.length);
  });
  return { situations, focals, introduction, expectedCodes, sources: paths };
}

export function generatedSource(data) {
  return `// Fichier généré. Ne pas modifier manuellement.\nimport type { PublicFocal, PublicSituation, PublicSituationsIntroduction } from "./publicSituations.types";\n\nexport const publicSituationsIntroduction = ${JSON.stringify(data.introduction, null, 2)} as const satisfies PublicSituationsIntroduction;\n\nexport const publicFocals = ${JSON.stringify(data.focals, null, 2)} as const satisfies readonly PublicFocal[];\n\nexport const publicSituations = ${JSON.stringify(data.situations, null, 2)} as const satisfies readonly PublicSituation[];\n`;
}

export function validatePublicSituations(data) {
  const { situations, focals } = data;
  const fail = (message) => { throw new Error(`Corpus public Situations — ${message}`); };
  if (situations.length !== 61) fail(`${situations.length} fiches au lieu de 61`);
  if (situations.map(({ code }) => code).join(",") !== expectedCodes.join(",")) fail("ordre canonique ou codes invalides");
  if (new Set(situations.map(({ code }) => code)).size !== 61) fail("code dupliqué");
  for (const [prefix, count] of [["V", 16], ["N", 13], ["I", 16], ["X", 16]]) if (situations.filter(({ code }) => code.startsWith(prefix)).length !== count) fail(`répartition ${prefix} invalide`);
  if (situations.filter(({ role }) => role === "obstacle").length !== 53 || situations.filter(({ role }) => role === "protection").length !== 8) fail("répartition des rôles invalide");
  const protections = situations.filter(({ role }) => role === "protection").map(({ code }) => code);
  if (protections.join(",") !== "V09,V10,N12,N13,I14,I15,X13,X14") fail(`protections invalides : ${protections.join(",")}`);
  if (situations.reduce((sum, item) => sum + item.usefulWords.length, 0) !== 183 || situations.some(({ usefulWords }) => usefulWords.length !== 3)) fail("183 associations ou trois mots par fiche non respectés");
  if (situations.some(({ continueTarget }) => !continueTarget.label || !continueTarget.type || !continueTarget.target || !continueTarget.status)) fail("renvoi final incomplet");
  if (focals.length !== 4) fail("quatre focales attendues");
  const allowedSituationKeys = ["code", "title", "focalId", "focalLabel", "focalSlug", "role", "illustrationFile", "altText", "canonicalText", "observe", "focalAnalysis", "whyItMatters", "protectionHeading", "protectiveContent", "otherReading", "usefulWords", "continueTarget"];
  for (const situation of situations) {
    const unexpected = Object.keys(situation).filter((key) => !allowedSituationKeys.includes(key));
    if (unexpected.length > 0) fail(`${situation.code} : champ interne ou inattendu ${unexpected.join(", ")}`);
  }
  return true;
}
