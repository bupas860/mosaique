import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const DEFAULT_CHARACTER_SOURCE = `${ROOT}docs/editorial-v2/010_Galerie_des_personnages_V2.md`;
export const DEFAULT_MODE_SOURCE = `${ROOT}docs/editorial-v2/100_Mode_Obstacles_visibles_V1.md`;

function fail(message) { throw new Error(`Parsing éditorial V2 — ${message}`); }
function required(text, regex, location) {
  const match = text.match(regex);
  if (!match) fail(`${location} introuvable ou invalide`);
  return match[1].trim();
}
function section(text, start, end, location) {
  const begin = text.search(start);
  if (begin < 0) fail(`section ${location} introuvable`);
  const tail = text.slice(begin);
  const finish = end ? tail.slice(1).search(end) : -1;
  return finish < 0 ? tail : tail.slice(0, finish + 1);
}
function markdownTable(text, headerPattern, location) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => headerPattern.test(line));
  if (start < 0) fail(`tableau ${location} introuvable`);
  const rows = [];
  for (let index = start; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) rows.push(lines[index]);
  if (rows.length < 3) fail(`tableau ${location} incomplet`);
  return rows
    .filter((_, index) => index !== 1)
    .map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
}
function contentUnderHeading(text, heading, nextHeading, location) {
  const start = text.search(heading);
  if (start < 0) fail(`${location} introuvable`);
  const after = text.slice(start).replace(/^.*\r?\n/, "");
  const end = after.search(nextHeading);
  return (end < 0 ? after : after.slice(0, end)).trim();
}
export function normalizeDecision(value, location = "décision") {
  const normalized = value.trim().toLocaleLowerCase("fr-FR").replace(/[.。]$/, "");
  if (["a", "avance"].includes(normalized)) return "advance";
  if (["r", "reste", "reste sur place"].includes(normalized)) return "stay";
  fail(`${location} : décision « ${value} » inconnue`);
}

function parseCharacters(markdown) {
  const matches = [...markdown.matchAll(/^## (P\d{2}) — (.+)$/gm)];
  if (matches.length === 0) fail("aucun personnage trouvé");
  return matches.map((match, index) => {
    const body = markdown.slice(match.index, matches[index + 1]?.index ?? markdown.length);
    const orientationMatch = body.match(/^- Orientation\s*:\s*(.+)$/m);
    const pronounMatch = body.match(/^- Pronom\s*:\s*(.+)$/m);
    const pointsBlock = contentUnderHeading(body, /^### Points importants pour le jeu$/m, /^(?:---|## )/m, `${match[1]} / points importants`);
    const character = {
      id: match[1], name: match[2].trim(),
      age: Number(required(body, /^- Âge\s*:\s*(\d+)\s*ans?$/m, `${match[1]} / âge`)),
      schoolLevel: required(body, /^- Classe\s*:\s*(.+)$/m, `${match[1]} / classe`),
      genderIdentity: required(body, /^- Identité de genre\s*:\s*(.+)$/m, `${match[1]} / identité de genre`),
      pronouns: pronounMatch ? pronounMatch[1].split(/[,/]/).map((item) => item.trim()).filter(Boolean) : [],
      presentation: contentUnderHeading(body, /^### Présentation$/m, /^### /m, `${match[1]} / présentation`),
      gamePoints: pointsBlock.split(/\r?\n/).filter((line) => /^-\s+/.test(line)).map((line) => line.replace(/^-\s+/, "").trim()),
    };
    if (orientationMatch) character.orientation = orientationMatch[1].trim();
    return character;
  });
}

function parseMatrix(markdown) {
  const body = section(markdown, /^## 9\. Matrice éditoriale complète/m, /^## 10\./m, "matrice générale");
  const tables = [
    markdownTable(body, /^\| Situation \| P01 —/, "matrice V01–V08"),
    markdownTable(body.slice(body.indexOf("### Situations V09 à V16")), /^\| Situation \| P01 —/, "matrice V09–V16"),
  ];
  const matrix = {};
  for (const table of tables) {
    const [header, ...rows] = table;
    for (const row of rows) {
      const [situationCell, ...values] = row;
      const situationId = required(situationCell, /^(V\d{2})\b/, "identifiant de ligne de matrice");
      if (matrix[situationId]) fail(`matrice : ligne ${situationId} dupliquée`);
      matrix[situationId] = Object.fromEntries(header.slice(1).map((characterCell, index) => { const characterId = required(characterCell, /^(P\d{2})\b/, `matrice ${situationId} / en-tête personnage`); return [characterId, normalizeDecision(values[index] ?? "", `matrice ${situationId}/${characterId}`)]; }));
    }
  }
  return matrix;
}

function parseSelectionRules(markdown) {
  const body = section(markdown, /^## 7\. Règles obligatoires de sélection/m, /^## 8\./m, "règles de sélection");
  const mandatorySituationIds = [...body.matchAll(/^- (V\d{2}) .+toujours présente\.$/gm)].map((match) => match[1]);
  const groupLines = [...body.matchAll(/^- Au moins une situation parmi ([^:]+)\s*:/gm)];
  const parseIds = (value) => [...value.matchAll(/V\d{2}/g)].map((match) => match[0]);
  required(body, /(Pour chaque personnage, au moins une des huit situations variables produit « reste sur place »)/, "minimum d’obstacles variables");
  required(body, /(aucun personnage ne reste donc sur place dans les huit situations variables à la fois)/, "maximum d’obstacles variables");
  return {
    totalSituationCount: Number(required(body, /exactement (\d+) situations/, "nombre total de situations")),
    mandatorySituationIds,
    variableSituationCount: Number(required(body, /- (\w+) situations variables/, "nombre de situations variables").replace("Huit", "8")),
    requiredGroups: groupLines.map((match) => parseIds(match[1])),
    limitedGroup: {
      situationIds: parseIds(required(body, /Au maximum deux situations parmi (.+?), afin/, "groupe limité")),
      maximum: 2,
    },
    variableObstacleRangePerCharacter: { minimum: 1, maximum: 7 },
  };
}

function parseSituationsAndFeedbacks(markdown, matrix) {
  const body = section(markdown, /^## 10\. Fiches éditoriales et retours individualisés/m, /^## 11\./m, "fiches détaillées");
  const matches = [...body.matchAll(/^### (V\d{2}) — (.+)$/gm)];
  if (matches.length === 0) fail("aucune fiche de situation trouvée");
  const situations = [];
  const feedbacks = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const detail = body.slice(match.index, matches[index + 1]?.index ?? body.length);
    const id = match[1];
    situations.push({
      id, modeId: "visible-obstacles", title: match[2].trim(),
      sceneType: required(detail, /^- Type de scène\s*:\s*(.+)$/m, `${id} / type de scène`),
      subfamily: required(detail, /^- Sous-famille\s*:\s*(.+)$/m, `${id} / sous-famille`),
      text: contentUnderHeading(detail, /^#### Texte affiché au joueur$/m, /^#### /m, `${id} / texte affiché`).split(/\n\n\*\*Question\s*:/)[0].trim(),
      question: required(detail, /^\*\*Question\s*:\s*(.+?)\*\*$/m, `${id} / question`),
      mechanism: required(detail, /\*\*Mécanisme :\*\*\s*(.+)$/m, `${id} / mécanisme`),
      caution: required(detail, /\*\*Point de vigilance :\*\*\s*(.+)$/m, `${id} / point de vigilance`),
      mandatory: required(detail, /^- Situation obligatoire\s*:\s*(oui|non)$/mi, `${id} / caractère obligatoire`).toLowerCase() === "oui",
    });
    const table = markdownTable(detail, /^\| Personnage \| Décision \| Retour individualisé à afficher \|/, `${id} / feedbacks`);
    for (const row of table.slice(1)) {
      const characterId = required(row[0], /^(P\d{2})\s+—/, `${id} / identifiant du feedback`);
      feedbacks.push({ situationId: id, characterId, decision: normalizeDecision(row[1], `feedback ${id}/${characterId}`), explanation: row[2].trim() });
    }
    if (!matrix[id]) fail(`matrice absente pour ${id}`);
  }
  return { situations, feedbacks };
}

export function parseEditorialV2(options = {}) {
  const characterMarkdown = options.characterMarkdown ?? readFileSync(options.characterSource ?? DEFAULT_CHARACTER_SOURCE, "utf8");
  const modeMarkdown = options.modeMarkdown ?? readFileSync(options.modeSource ?? DEFAULT_MODE_SOURCE, "utf8");
  const matrix = parseMatrix(modeMarkdown);
  const { situations, feedbacks } = parseSituationsAndFeedbacks(modeMarkdown, matrix);
  return { characters: parseCharacters(characterMarkdown), mode: { id: "visible-obstacles", situations, matrix, feedbacks, selectionRules: parseSelectionRules(modeMarkdown) } };
}
