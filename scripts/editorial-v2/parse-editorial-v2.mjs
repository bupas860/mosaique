import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GALLERIES, MODES, ROOT } from "./editorial-config.mjs";

function fail(file, location, message) {
  throw new Error(`${file} — ${location} — ${message}`);
}

function frontMatter(markdown, file) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) fail(file, "front matter", "absent");
  return Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf(":");
    if (separator < 1) fail(file, "front matter", `ligne invalide : ${line}`);
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim().replace(/^"|"$/g, "")];
  }));
}

function tableAfter(markdown, headerPattern, file, location, offset = 0) {
  const lines = markdown.slice(offset).split(/\r?\n/);
  const start = lines.findIndex((line) => headerPattern.test(line));
  if (start < 0) fail(file, location, "tableau introuvable");
  const rows = [];
  for (let index = start; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) {
    rows.push(lines[index].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  }
  if (rows.length < 3) fail(file, location, "tableau incomplet");
  return [rows[0], ...rows.slice(2)];
}

function required(text, pattern, file, location) {
  const match = text.match(pattern);
  if (!match) fail(file, location, "champ introuvable");
  return match[1].trim();
}

function headingContent(text, heading, file, location) {
  const match = heading.exec(text);
  if (!match) fail(file, location, "section introuvable");
  const after = text.slice(match.index + match[0].length).replace(/^\r?\n/, "");
  const end = after.search(/^#### |^### /m);
  return (end < 0 ? after : after.slice(0, end)).trim();
}

export function normalizeDecision(value, file, location) {
  const decision = value.trim().toLocaleLowerCase("fr-FR").replace(/[.。]$/, "");
  if (decision === "a" || decision === "avance") return "advance";
  if (decision === "r" || decision === "reste" || decision === "reste sur place") return "stay";
  fail(file, location, `décision inconnue « ${value} »`);
}

function parseGeneralGallery(markdown, config) {
  const matches = [...markdown.matchAll(/^## (P\d{2}) — (.+)$/gm)];
  return matches.map((match, index) => {
    const body = markdown.slice(match.index, matches[index + 1]?.index ?? markdown.length);
    const orientation = body.match(/^- Orientation\s*:\s*(.+)$/m)?.[1].trim();
    const pronouns = body.match(/^- Pronom\s*:\s*(.+)$/m)?.[1].split(/[,/]/).map((item) => item.trim()).filter(Boolean) ?? [];
    const gamePointsText = headingContent(body, /^### Points importants pour le jeu$/m, config.sourceFile, `${match[1]} points importants`);
    return {
      id: match[1],
      name: match[2].trim(),
      age: Number(required(body, /^- Âge\s*:\s*(\d+)\s*ans?$/m, config.sourceFile, `${match[1]} âge`)),
      schoolLevel: required(body, /^- Classe\s*:\s*(.+)$/m, config.sourceFile, `${match[1]} classe`),
      genderIdentity: required(body, /^- Identité de genre\s*:\s*(.+)$/m, config.sourceFile, `${match[1]} identité de genre`),
      ...(orientation ? { orientation } : {}),
      pronouns,
      presentation: headingContent(body, /^### Présentation$/m, config.sourceFile, `${match[1]} présentation`),
      gamePoints: gamePointsText.split(/\r?\n/).filter((line) => /^-\s+/.test(line)).map((line) => line.replace(/^-\s+/, "").trim()),
    };
  });
}

function parseIntersectionalGallery(markdown, config) {
  const table = tableAfter(markdown, /^\| Personnage \| Profil retenu \|/, config.sourceFile, "galerie intersectionnelle");
  return table.slice(1).map(([identity, profile]) => {
    const match = identity.match(/^(XP\d{2}) — (.+)$/);
    if (!match) fail(config.sourceFile, identity, "identifiant de personnage invalide");
    const ageAndLevel = profile.match(/^(\d+) ans,\s*([^—]+)\s*—/);
    if (!ageAndLevel) fail(config.sourceFile, match[1], "âge ou classe absent");
    const pronouns = /pronom « iel »/i.test(profile) ? ["iel"] : [];
    return { id: match[1], name: match[2], age: Number(ageAndLevel[1]), schoolLevel: ageAndLevel[2].trim(), profile, pronouns };
  });
}

function parseGallery(config, markdown) {
  const metadata = frontMatter(markdown, config.sourceFile);
  return {
    id: config.id,
    documentId: metadata.document_id,
    sourceFile: config.sourceFile,
    characters: config.id === "general" ? parseGeneralGallery(markdown, config) : parseIntersectionalGallery(markdown, config),
  };
}

function parseMatrix(markdown, config, characterIds) {
  const lines = markdown.split(/\r?\n/);
  const starts = lines.map((line, index) => (/^\| Situation \| (?:X?P)01 —/.test(line) ? index : -1)).filter((index) => index >= 0);
  if (starts.length === 0) fail(config.sourceFile, `${config.id} matrice`, "tableau introuvable");
  const tables = starts.map((start) => {
    const rows = [];
    for (let index = start; index < lines.length && /^\s*\|/.test(lines[index]); index += 1) rows.push(lines[index].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
    return [rows[0], ...rows.slice(2)];
  });
  const header = tables[0][0];
  const rows = tables.flatMap((table) => table.slice(1));
  const headerIds = header.slice(1).map((cell) => required(cell, /^((?:X?P)\d{2})\b/, config.sourceFile, `${config.id} en-tête matrice`));
  const matrix = {};
  for (const row of rows) {
    const id = required(row[0], new RegExp(`^(${config.prefix}\\d{2})\\b`), config.sourceFile, `${config.id} ligne matrice`);
    if (matrix[id]) fail(config.sourceFile, `${config.id}/${id}`, "ligne matricielle dupliquée");
    matrix[id] = Object.fromEntries(headerIds.map((characterId, index) => [
      characterId,
      normalizeDecision(row[index + 1] ?? "", config.sourceFile, `${config.id}/${id}/${characterId}`),
    ]));
  }
  if (headerIds.join(",") !== characterIds.join(",")) fail(config.sourceFile, `${config.id} matrice`, "galerie ou ordre des personnages incorrect");
  return matrix;
}

function parseSituations(markdown, config, matrix) {
  const matches = [...markdown.matchAll(new RegExp(`^### (${config.prefix}\\d{2}) — (.+)$`, "gm"))];
  const situations = [];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const detail = markdown.slice(match.index, matches[index + 1]?.index ?? markdown.length);
    const id = match[1];
    const playerSection = headingContent(detail, /^#### Texte affiché au joueur$/m, config.sourceFile, `${config.id}/${id} texte joueur`);
    const playerText = playerSection.split(/\n\n\*\*Question\s*:/)[0].trim();
    const interpretation = detail.match(/^\*\*Interprétation\s*:\*\*\s*(.+)$/m)?.[1].trim();
    const vigilance = detail.match(/^\*\*Point de vigilance\s*:\*\*\s*(.+)$/m)?.[1].trim();
    const intersectionalTest = detail.match(/^\*\*Test intersectionnel\s*:\*\*\s*(.+)$/m)?.[1].trim();
    situations.push({
      id,
      modeId: config.id,
      title: match[2].trim(),
      playerText,
      question: required(detail, /^\*\*Question\s*:\s*(.+?)\*\*$/m, config.sourceFile, `${config.id}/${id} question`),
      sceneType: required(detail, /^- Type de scène\s*:\s*(.+)$/m, config.sourceFile, `${config.id}/${id} type`),
      ...(detail.match(/^- Sous-famille\s*:\s*(.+)$/m)?.[1].trim() ? { subfamily: detail.match(/^- Sous-famille\s*:\s*(.+)$/m)[1].trim() } : {}),
      mechanism: required(detail, /^\*\*Mécanisme(?: principal)?\s*:\*\*\s*(.+)$/m, config.sourceFile, `${config.id}/${id} mécanisme`),
      ...(interpretation ? { interpretation } : {}),
      ...(vigilance ? { vigilance } : {}),
      ...(intersectionalTest ? { intersectionalTest } : {}),
      mandatory: required(detail, /^- Situation obligatoire\s*:\s*(oui|non)$/mi, config.sourceFile, `${config.id}/${id} obligatoire`).toLowerCase() === "oui",
      protective: config.mandatoryIds.includes(id),
      effectsByCharacter: matrix[id],
      feedbacksByCharacter: {},
    });
  }
  for (const situation of situations) {
    const start = markdown.indexOf(`### ${situation.id} —`);
    const next = situations.find((candidate) => candidate.id !== situation.id && markdown.indexOf(`### ${candidate.id} —`) > start);
    const detail = markdown.slice(start, next ? markdown.indexOf(`### ${next.id} —`) : markdown.length);
    const table = tableAfter(detail, /^\| Personnage \| Décision \| Retour individualisé à afficher \|/, config.sourceFile, `${config.id}/${situation.id} feedbacks`);
    for (const [identity, decision, explanation] of table.slice(1)) {
      const characterId = required(identity, /^((?:X?P)\d{2})\s+—/, config.sourceFile, `${config.id}/${situation.id} feedback`);
      const normalized = normalizeDecision(decision, config.sourceFile, `${config.id}/${situation.id}/${characterId}`);
      situation.feedbacksByCharacter[characterId] = { decision: normalized, explanation };
    }
  }
  return situations;
}

function generatedRules(config) {
  return {
    modeId: config.id,
    galleryId: config.galleryId,
    totalSituationCount: 10,
    variableSituationCount: config.variableCount,
    mandatorySituationIds: config.mandatoryIds,
    variableSituationIds: config.variableIds,
    requiredGroups: config.requiredGroups.map((situationIds, index) => ({ id: `group-${index + 1}`, minimum: 1, situationIds })),
    limitedGroups: config.limitedGroups.map((group, index) => ({ id: `limit-${index + 1}`, ...group })),
    characterRequirements: config.characterRequirements ?? {},
    variableObstacleRangePerCharacter: { minimum: config.obstacleRange[0], maximum: config.obstacleRange[1] },
  };
}

function parseMode(config, markdown) {
  const metadata = frontMatter(markdown, config.sourceFile);
  if (config.id === "discovery") {
    return {
      id: config.id,
      documentId: metadata.document_id,
      declaredModeId: metadata.mode_id,
      declaredSituationCount: Number(metadata.own_situation_count),
      declaredCharacterCount: Number(metadata.character_count),
      declaredFeedbackCount: Number(metadata.feedback_count),
      sourceFile: config.sourceFile,
      galleryId: config.galleryId,
      bankType: "transversal",
      situations: [],
      references: config.sourceModes.flatMap((originMode) => MODES[originMode].situationIds.map((id) => ({ id, originMode }))),
      rules: {
        modeId: config.id,
        galleryId: config.galleryId,
        totalSituationCount: 10,
        quotas: config.quotas,
        sourceModes: config.sourceModes,
        protectiveCount: config.protectiveCount,
        intersectionalIncluded: false,
        characterRequirements: config.characterRequirements,
        obstacleRangePerCharacter: { minimum: config.obstacleRange[0], maximum: config.obstacleRange[1] },
      },
    };
  }
  const characterIds = GALLERIES[config.galleryId].characterIds;
  const matrix = parseMatrix(markdown, config, characterIds);
  return {
    id: config.id,
    documentId: metadata.document_id,
    declaredModeId: metadata.mode_id,
    declaredSituationCount: Number(metadata.situation_count),
    declaredCharacterCount: Number(metadata.character_count),
    declaredFeedbackCount: Number(metadata.feedback_count),
    sourceFile: config.sourceFile,
    galleryId: config.galleryId,
    situations: parseSituations(markdown, config, matrix),
    rules: generatedRules(config),
  };
}

export function parseEditorialV2(options = {}) {
  const read = (relativePath) => options.markdownByFile?.[relativePath] ?? readFileSync(join(ROOT, relativePath), "utf8");
  const galleries = Object.fromEntries(Object.entries(GALLERIES).map(([id, config]) => [id, parseGallery(config, read(config.sourceFile))]));
  const modes = Object.fromEntries(Object.entries(MODES).map(([id, config]) => [id, parseMode(config, read(config.sourceFile))]));
  return { schemaVersion: 2, galleries, modes };
}
