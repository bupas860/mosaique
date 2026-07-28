import { pathToFileURL } from "node:url";

import { GALLERIES, MODES } from "./editorial-config.mjs";
import { parseEditorialV2 } from "./parse-editorial-v2.mjs";
import { assertSelectionReferences } from "./selection-analysis.mjs";

const VALID_DECISIONS = new Set(["advance", "stay"]);
const sameSet = (actual, expected) => actual.length === expected.length && expected.every((value) => actual.includes(value));

export function validateEditorialV2(data, options = {}) {
  const errors = [];
  const error = (file, mode, situation, character, rule) => {
    errors.push([file, mode && `mode ${mode}`, situation && `situation ${situation}`, character && `personnage ${character}`, rule].filter(Boolean).join(" — "));
  };

  const allGalleryIds = [];
  for (const [galleryId, config] of Object.entries(GALLERIES)) {
    const gallery = data?.galleries?.[galleryId];
    const file = config.sourceFile;
    if (!gallery) {
      error(file, undefined, undefined, undefined, "galerie absente");
      continue;
    }
    if (gallery.documentId !== config.documentId) error(file, undefined, undefined, undefined, `document_id attendu ${config.documentId}, trouvé ${gallery.documentId}`);
    const characters = gallery.characters ?? [];
    if (characters.length !== config.count) error(file, undefined, undefined, undefined, `${config.count} personnages attendus, ${characters.length} trouvés`);
    const ids = characters.map(({ id }) => id);
    if (!sameSet(ids, config.characterIds)) error(file, undefined, undefined, undefined, `identifiants attendus ${config.characterIds.join(", ")}, trouvés ${ids.join(", ")}`);
    if (new Set(ids).size !== ids.length) error(file, undefined, undefined, undefined, "identifiant de personnage dupliqué");
    allGalleryIds.push(...ids);
    for (const character of characters) {
      if (!character.name?.trim()) error(file, undefined, undefined, character.id, "prénom absent");
      if (!Number.isInteger(character.age) || character.age <= 0) error(file, undefined, undefined, character.id, "âge absent ou invalide");
      if (!character.schoolLevel?.trim()) error(file, undefined, undefined, character.id, "classe absente");
      if (!Array.isArray(character.pronouns)) error(file, undefined, undefined, character.id, "champ pronouns absent");
      if (galleryId === "general") {
        if (!character.genderIdentity?.trim()) error(file, undefined, undefined, character.id, "identité de genre absente");
        if (!character.presentation?.trim()) error(file, undefined, undefined, character.id, "présentation absente");
        if (!character.gamePoints?.length) error(file, undefined, undefined, character.id, "points de jeu absents");
      } else if (!character.profile?.trim()) error(file, undefined, undefined, character.id, "profil absent");
    }
    const explicitPronounId = galleryId === "general" ? "P03" : "XP04";
    const explicit = characters.find(({ id }) => id === explicitPronounId);
    if (JSON.stringify(explicit?.pronouns) !== JSON.stringify(["iel"])) error(file, undefined, undefined, explicitPronounId, "le pronom explicite iel doit être conservé");
  }
  if (new Set(allGalleryIds).size !== allGalleryIds.length) error("galeries V2", undefined, undefined, undefined, "collision d’identifiants entre Pxx et XPxx");

  let totalSituations = 0;
  let totalDecisions = 0;
  let totalFeedbacks = 0;
  for (const [modeId, config] of Object.entries(MODES)) {
    const mode = data?.modes?.[modeId];
    const file = config.sourceFile;
    if (!mode) {
      error(file, modeId, undefined, undefined, "banque absente");
      continue;
    }
    if (mode.documentId !== config.documentId) error(file, modeId, undefined, undefined, `document_id attendu ${config.documentId}, trouvé ${mode.documentId}`);
    if (mode.declaredModeId !== modeId) error(file, modeId, undefined, undefined, `mode_id attendu ${modeId}, trouvé ${mode.declaredModeId}`);
    if (mode.galleryId !== config.galleryId) error(file, modeId, undefined, undefined, `galerie attendue ${config.galleryId}, trouvée ${mode.galleryId}`);
    const characters = GALLERIES[config.galleryId].characterIds;
    if (modeId === "discovery") {
      if (mode.situations.length !== 0 || mode.declaredSituationCount !== 0) error(file, modeId, undefined, undefined, "Découverte ne doit contenir aucune situation propre");
      if (mode.rules.intersectionalIncluded !== false) error(file, modeId, undefined, undefined, "Intersectionnalités doit être exclu");
      if (JSON.stringify(mode.rules.quotas) !== JSON.stringify(config.quotas)) error(file, modeId, undefined, undefined, "quotas 3 V / 3 N / 4 I non conformes");
      if (mode.rules.protectiveCount !== 2) error(file, modeId, undefined, undefined, "exactement deux protections attendues");
      for (const reference of mode.references) {
        if (!config.sourceModes.includes(reference.originMode)) error(file, modeId, reference.id, undefined, `originMode interdit : ${reference.originMode}`);
        if (/^X/.test(reference.id)) error(file, modeId, reference.id, undefined, "une carte X ne peut pas être référencée");
        if (!MODES[reference.originMode]?.situationIds.includes(reference.id)) error(file, modeId, reference.id, undefined, "référence inconnue dans le mode source");
      }
      continue;
    }
    const situations = mode.situations ?? [];
    totalSituations += situations.length;
    if (situations.length !== config.situationCount || mode.declaredSituationCount !== config.situationCount) error(file, modeId, undefined, undefined, `${config.situationCount} situations attendues`);
    if (mode.declaredCharacterCount !== characters.length) error(file, modeId, undefined, undefined, `${characters.length} personnages attendus dans le front matter`);
    if (mode.declaredFeedbackCount !== config.feedbackCount) error(file, modeId, undefined, undefined, `${config.feedbackCount} feedbacks attendus dans le front matter`);
    const ids = situations.map(({ id }) => id);
    if (!sameSet(ids, config.situationIds)) error(file, modeId, undefined, undefined, `identifiants attendus ${config.situationIds.join(", ")}`);
    if (new Set(ids).size !== ids.length) error(file, modeId, undefined, undefined, "identifiant de situation dupliqué");
    let modeFeedbackCount = 0;
    for (const situation of situations) {
      if (!situation.id.startsWith(config.prefix)) error(file, modeId, situation.id, undefined, `préfixe ${config.prefix} attendu`);
      if (situation.modeId !== modeId) error(file, modeId, situation.id, undefined, `modeId de situation divergent : ${situation.modeId}`);
      for (const field of ["title", "playerText", "sceneType", "mechanism"]) if (!situation[field]?.trim()) error(file, modeId, situation.id, undefined, `champ ${field} absent`);
      if (modeId === "intersectionalities" && !situation.intersectionalTest?.trim()) error(file, modeId, situation.id, undefined, "test intersectionnel absent");
      if (modeId !== "intersectionalities" && !situation.vigilance?.trim()) error(file, modeId, situation.id, undefined, "point de vigilance absent");
      const expectedMandatory = config.mandatoryIds.includes(situation.id);
      if (situation.mandatory !== expectedMandatory || situation.protective !== expectedMandatory) error(file, modeId, situation.id, undefined, `mandatory/protective doit valoir ${expectedMandatory}`);
      const decisionIds = Object.keys(situation.effectsByCharacter ?? {});
      if (!sameSet(decisionIds, characters)) error(file, modeId, situation.id, undefined, "décisions absentes ou personnages étrangers");
      const feedbackIds = Object.keys(situation.feedbacksByCharacter ?? {});
      if (!sameSet(feedbackIds, characters)) error(file, modeId, situation.id, undefined, "feedbacks absents ou personnages étrangers");
      totalDecisions += decisionIds.length;
      modeFeedbackCount += feedbackIds.length;
      for (const characterId of characters) {
        const decision = situation.effectsByCharacter?.[characterId];
        const feedback = situation.feedbacksByCharacter?.[characterId];
        if (!VALID_DECISIONS.has(decision)) error(file, modeId, situation.id, characterId, `décision invalide : ${decision}`);
        if (!feedback?.explanation?.trim()) error(file, modeId, situation.id, characterId, "feedback absent ou vide");
        if (feedback?.decision !== decision) error(file, modeId, situation.id, characterId, `feedback ${feedback?.decision ?? "absent"} divergent de la matrice ${decision ?? "absente"}`);
        if (expectedMandatory && decision !== "advance") error(file, modeId, situation.id, characterId, "une protection fixe doit faire avancer tous les personnages");
      }
    }
    totalFeedbacks += modeFeedbackCount;
    if (modeFeedbackCount !== config.feedbackCount) error(file, modeId, undefined, undefined, `${config.feedbackCount} feedbacks attendus, ${modeFeedbackCount} trouvés`);
    if (!sameSet(mode.rules.mandatorySituationIds, config.mandatoryIds)) error(file, modeId, undefined, undefined, `protections fixes attendues ${config.mandatoryIds.join(", ")}`);
  }

  let selection;
  if (errors.length === 0 && options.checkSelections !== false) {
    selection = assertSelectionReferences(data);
    for (const message of selection.errors) error("sélection V2", undefined, undefined, undefined, message);
  }
  return {
    valid: errors.length === 0,
    errors,
    summary: {
      galleryCount: Object.keys(data?.galleries ?? {}).length,
      characterCount: Object.values(data?.galleries ?? {}).reduce((count, gallery) => count + gallery.characters.length, 0),
      modeCount: Object.keys(data?.modes ?? {}).length,
      situationCount: totalSituations,
      decisionCount: totalDecisions,
      feedbackCount: totalFeedbacks,
      selection: selection?.analyses,
    },
  };
}

function main() {
  try {
    const result = validateEditorialV2(parseEditorialV2());
    if (!result.valid) {
      console.error("Validation éditoriale V2 échouée\n");
      result.errors.forEach((message) => console.error(`- ${message}`));
      process.exitCode = 1;
      return;
    }
    console.log("Validation éditoriale V2 réussie");
    console.log(`Galeries : ${result.summary.galleryCount} (${result.summary.characterCount} personnages)`);
    console.log(`Modes : ${result.summary.modeCount}`);
    console.log(`Banques détaillées : ${result.summary.situationCount} situations, ${result.summary.decisionCount} décisions, ${result.summary.feedbackCount} feedbacks`);
    console.log("Matrices, feedbacks, protections et références Découverte : conformes");
    console.log("Contrôles combinatoires de référence : conformes");
  } catch (cause) {
    console.error(`Validation éditoriale V2 impossible : ${cause instanceof Error ? cause.message : String(cause)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
