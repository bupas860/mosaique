import fs from "node:fs";

const situationsMarkdownPath = "docs/001_Banque_des_situations.md";
const feedbacksMarkdownPath = "docs/020_Feedbacks_pedagogiques.md";
const mechanismsMarkdownPath = "docs/003_Mecanismes_sociaux_V2.md";
const matrixMarkdownPath = "docs/005_Matrice_de_jeu_V2.md";
const situationsJsonPath = "src/data/situations.json";
const feedbacksJsonPath = "src/data/situation-character-feedbacks.json";
const mechanismsJsonPath = "src/data/mechanisms.json";
const matrixJsonPath = "src/data/matrix.json";
const mosaicDataJsonPath = "src/data/mosaic-data.json";

const characterIdsByName = {
  Noé: "P01",
  Jade: "P02",
  Sam: "P03",
  Arthur: "P04",
  Sofia: "P05",
  Mehdi: "P06",
  Camille: "P07",
  Alex: "P08",
};

function sectionsByHeading(markdown, pattern) {
  const headings = [...markdown.matchAll(pattern)];
  return headings.map((heading, index) => ({
    match: heading,
    body: markdown.slice(heading.index, headings[index + 1]?.index ?? markdown.length),
  }));
}

function markdownField(body, heading) {
  if (heading === "Situation") {
    const match = body.match(/^\*\*Situation :\*\*\s*$\n+([\s\S]*?)(?=^---\s*$|^# |(?![\s\S]))/m);
    return match?.[1].trim();
  }

  return body.match(new RegExp(`^\\*\\*${heading} :\\*\\* (.+)$`, "m"))?.[1].trim();
}

const situationsMarkdown = fs.readFileSync(situationsMarkdownPath, "utf8");
const currentSituations = JSON.parse(fs.readFileSync(situationsJsonPath, "utf8"));
const situationSections = sectionsByHeading(
  situationsMarkdown,
  /^# (S\d{2}) — (.+)$/gm,
);
const editorialSituations = new Map();
const duplicateSituationIds = new Set();

for (const { match, body } of situationSections) {
  const [, id, title] = match;
  const candidate = {
    title,
    mechanism: markdownField(body, "Mécanisme principal"),
    mechanismId: markdownField(body, "Identifiant du mécanisme"),
    context: markdownField(body, "Contexte"),
    text: markdownField(body, "Situation"),
  };
  const previous = editorialSituations.get(id);

  if (previous) {
    duplicateSituationIds.add(id);
    for (const field of ["title", "mechanism", "context", "text"]) {
      if (candidate[field] && previous[field] && candidate[field] !== previous[field]) {
        throw new Error(`Doublon contradictoire dans la banque : ${id}.${field}`);
      }
    }
    editorialSituations.set(id, {
      ...candidate,
      ...Object.fromEntries(Object.entries(previous).filter(([, value]) => value)),
    });
    continue;
  }

  editorialSituations.set(id, candidate);
}

const updatedSituations = currentSituations.map((situation) => {
  const editorial = editorialSituations.get(situation.id);
  if (!editorial) return situation;
  if (!editorial.title || !editorial.context || !editorial.text) {
    throw new Error(`Situation éditoriale incomplète : ${situation.id}`);
  }

  const updatedSituation = {
    ...situation,
    title: editorial.title,
    context: editorial.context,
    text: editorial.text,
    legacyMechanismLabel: editorial.mechanism ?? situation.legacyMechanismLabel,
    mechanismIds: editorial.mechanismId
      ? [editorial.mechanismId]
      : situation.mechanismIds,
  };
  delete updatedSituation.pedagogicalIntent;
  delete updatedSituation.feedback;
  return updatedSituation;
});

const unknownSituationIds = [...editorialSituations.keys()].filter(
  (id) => !currentSituations.some((situation) => situation.id === id),
);
if (unknownSituationIds.length) {
  throw new Error(`Situations inconnues : ${unknownSituationIds.join(", ")}`);
}

function valueAfterHeading(body, headingTest) {
  const lines = body.split("\n");
  const headingIndex = lines.findIndex(headingTest);
  if (headingIndex < 0) return undefined;
  let end = headingIndex + 1;
  while (
    end < lines.length
    && !lines[end].startsWith("### ")
    && !lines[end].startsWith("## ")
    && lines[end].trim() !== "---"
  ) end += 1;
  return lines.slice(headingIndex + 1, end).join("\n").trim();
}

const feedbacksMarkdown = fs.readFileSync(feedbacksMarkdownPath, "utf8");
const feedbackSituationSections = sectionsByHeading(
  feedbacksMarkdown,
  /^# (S\d{2}) — (.+)$/gm,
);
const importedFeedbacks = {};
const unknownCharacters = new Set();
const duplicateFeedbacks = [];
const incompleteFeedbacks = [];
const feedbackTitleMismatches = [];
const duplicatedSituationTexts = [];

for (const { match, body } of feedbackSituationSections) {
  const situationId = match[1];
  if (!currentSituations.some(({ id }) => id === situationId)) continue;
  const editorialSituation = editorialSituations.get(situationId);
  if (editorialSituation && match[2] !== editorialSituation.title) {
    feedbackTitleMismatches.push(`${situationId}: ${match[2]} ≠ ${editorialSituation.title}`);
  }
  if (editorialSituation?.text && body.includes(editorialSituation.text)) {
    duplicatedSituationTexts.push(situationId);
  }
  const characterSections = sectionsByHeading(body, /^## (.+)$/gm)
    .filter(({ match: characterMatch }) => characterMatch[1] !== "Situation");

  for (const { match: characterMatch, body: characterBody } of characterSections) {
    const characterName = characterMatch[1];
    const characterId = characterIdsByName[characterName];
    if (!characterId) {
      unknownCharacters.add(characterName);
      continue;
    }

    const obstacleText = characterBody.match(/^Obstacle : (Oui|Non)$/m)?.[1];
    const explanation = valueAfterHeading(characterBody, (line) => line.startsWith("### Pourquoi"));
    const schoolGoodPractice = valueAfterHeading(
      characterBody,
      (line) => line.replaceAll("’", "'") === "### Que peut faire l'établissement ?",
    );
    const takeaway = valueAfterHeading(characterBody, (line) => line === "### À retenir");
    const normalizedObstacle = obstacleText?.replace(/\.$/, "");

    if (!explanation || !schoolGoodPractice || !takeaway || !["Oui", "Non"].includes(normalizedObstacle)) {
      incompleteFeedbacks.push(`${situationId}/${characterName}`);
      continue;
    }

    const feedback = {
      obstacle: normalizedObstacle === "Oui",
      explanation,
      schoolGoodPractice,
      takeaway,
    };
    const existing = importedFeedbacks[situationId]?.[characterId];

    if (existing) {
      duplicateFeedbacks.push(`${situationId}/${characterName}`);
      if (JSON.stringify(existing) !== JSON.stringify(feedback)) {
        delete importedFeedbacks[situationId][characterId];
      }
      continue;
    }

    importedFeedbacks[situationId] ??= {};
    importedFeedbacks[situationId][characterId] = feedback;
  }
}

const categoryIds = {
  "Normes implicites": "implicit_norms",
  Invisibilisation: "invisibility",
  "Fonctionnement des institutions": "institutional_processes",
  "Relations sociales": "social_relations",
  "Discriminations explicites": "explicit_discrimination",
  "Facteurs de protection": "protective_factor",
};
const visibilityIds = {
  "Très faible": "very_low",
  Faible: "low",
  Moyen: "medium",
  Élevé: "high",
};
const mechanismsMarkdown = fs.readFileSync(mechanismsMarkdownPath, "utf8");
const currentMechanisms = JSON.parse(fs.readFileSync(mechanismsJsonPath, "utf8"));
const mechanismSections = sectionsByHeading(
  mechanismsMarkdown,
  /^## (M\d{3}) — (.+)$/gm,
);
const canonicalMechanisms = new Map(mechanismSections.map(({ match, body }) => {
  const categoryLabel = body.match(/^\*\*Catégorie\*\*\s*:\s*(.+)$/m)?.[1].trim();
  const definition = body.match(/^\*\*Définition\*\*\s*\n+([^\n]+)/m)?.[1].trim();
  const visibilityLabel = body.match(/^\*\*Niveau de visibilité\*\*\s*:\s*(.+)$/m)?.[1].trim();
  if (!categoryIds[categoryLabel] || !definition) {
    throw new Error(`Mécanisme canonique incomplet : ${match[1]}`);
  }
  return [match[1], {
    id: match[1],
    name: match[2],
    category: categoryIds[categoryLabel],
    definition,
    ...(visibilityLabel ? { visibility: visibilityIds[visibilityLabel] } : {}),
  }];
}));
const updatedMechanisms = [...canonicalMechanisms.values()].map((mechanism) => {
  const current = currentMechanisms.find(({ id }) => id === mechanism.id);
  return { ...current, ...mechanism, visibility: mechanism.visibility ?? current?.visibility ?? "low" };
});

const matrixMarkdown = fs.readFileSync(matrixMarkdownPath, "utf8");
const currentMatrix = JSON.parse(fs.readFileSync(matrixJsonPath, "utf8"));
const importedMatrix = structuredClone(currentMatrix);
const matrixRows = [...matrixMarkdown.matchAll(
  /^\| (S\d{2}) [–—-] [^|]+\| [^|]+\| ([01]) \| ([01]) \| ([01]) \| ([01]) \| ([01]) \| ([01]) \| ([01]) \| ([01]) \|$/gm,
)];
for (const row of matrixRows) {
  importedMatrix[row[1]] = Object.fromEntries(
    Object.values(characterIdsByName).map((characterId, index) => [characterId, Number(row[index + 2])]),
  );
}

const mechanismIds = new Set(updatedMechanisms.map(({ id }) => id));
const unknownMechanismReferences = updatedSituations.flatMap((situation) =>
  situation.mechanismIds
    .filter((id) => !mechanismIds.has(id))
    .map((id) => `${situation.id}/${id}`));
if (unknownMechanismReferences.length) {
  throw new Error(`Identifiants de mécanismes inconnus : ${unknownMechanismReferences.join(", ")}`);
}

const matrixFeedbackMismatches = [];
for (const situationId of matrixRows.map((row) => row[1])) {
  for (const characterId of Object.values(characterIdsByName)) {
    const expected = importedFeedbacks[situationId]?.[characterId]?.obstacle ? 0 : 1;
    if (importedMatrix[situationId]?.[characterId] !== expected) {
      matrixFeedbackMismatches.push(`${situationId}/${characterId}`);
    }
  }
}
if (matrixFeedbackMismatches.length) {
  throw new Error(`Incohérences matrice/feedback : ${matrixFeedbackMismatches.join(", ")}`);
}

fs.writeFileSync(situationsJsonPath, `${JSON.stringify(updatedSituations, null, 2)}\n`);
fs.writeFileSync(feedbacksJsonPath, `${JSON.stringify(importedFeedbacks, null, 2)}\n`);
fs.writeFileSync(mechanismsJsonPath, `${JSON.stringify(updatedMechanisms, null, 2)}\n`);
fs.writeFileSync(matrixJsonPath, `${JSON.stringify(importedMatrix, null, 2)}\n`);

const currentMosaicData = JSON.parse(fs.readFileSync(mosaicDataJsonPath, "utf8"));
const updatedMosaicData = {
  ...currentMosaicData,
  mechanisms: updatedMechanisms,
  situations: updatedSituations,
  matrix: importedMatrix,
};
fs.writeFileSync(mosaicDataJsonPath, `${JSON.stringify(updatedMosaicData, null, 2)}\n`);

console.log(JSON.stringify({
  integratedSituationIds: [...editorialSituations.keys()],
  duplicateSituationIds: [...duplicateSituationIds],
  integratedFeedbacks: Object.values(importedFeedbacks)
    .reduce((total, feedbacks) => total + Object.keys(feedbacks).length, 0),
  unknownCharacters: [...unknownCharacters],
  duplicateFeedbacks,
  incompleteFeedbacks,
  feedbackTitleMismatches,
  duplicatedSituationTexts,
  integratedMechanismIds: [...canonicalMechanisms.keys()],
  integratedMatrixSituationIds: matrixRows.map((row) => row[1]),
  unknownMechanismReferences,
  matrixFeedbackMismatches,
}, null, 2));
