import { EXPECTED_SELECTION_COUNTS, GALLERIES, MODES } from "./editorial-config.mjs";

export function combinations(values, size) {
  const result = [];
  const visit = (start, current) => {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let index = start; index <= values.length - (size - current.length); index += 1) {
      current.push(values[index]);
      visit(index + 1, current);
      current.pop();
    }
  };
  visit(0, []);
  return result;
}

const countIn = (ids, group) => group.filter((id) => ids.has(id)).length;

function thematicSelectionValid(candidate, config) {
  const selected = new Set(candidate);
  return selected.size === candidate.length
    && config.requiredGroups.every((group) => countIn(selected, group) >= 1)
    && config.limitedGroups.every((group) => countIn(selected, group.situationIds) <= group.maximum);
}

function characterRequirementValid(selected, requirement = {}) {
  if (requirement.all?.some((id) => !selected.has(id))) return false;
  if (requirement.any && !requirement.any.some((id) => selected.has(id))) return false;
  if (requirement.atLeast && countIn(selected, requirement.atLeast.ids) < requirement.atLeast.count) return false;
  return true;
}

export function analyzeBankSelections(bank) {
  const config = MODES[bank.id];
  const characterIds = GALLERIES[config.galleryId].characterIds;
  const byId = Object.fromEntries(bank.situations.map((situation) => [situation.id, situation]));
  const examined = combinations(config.variableIds, config.variableCount);
  const thematic = examined.filter((candidate) => thematicSelectionValid(candidate, config));
  const countsByCharacter = {};
  for (const characterId of characterIds) {
    countsByCharacter[characterId] = thematic.filter((candidate) => {
      const selected = new Set(candidate);
      if (!characterRequirementValid(selected, config.characterRequirements?.[characterId])) return false;
      const obstacles = candidate.filter((id) => byId[id].effectsByCharacter[characterId] === "stay").length;
      return obstacles >= config.obstacleRange[0] && obstacles <= config.obstacleRange[1];
    }).length;
  }
  const validForAllCharactersCount = thematic.filter((candidate) => characterIds.every((characterId) => {
    const obstacles = candidate.filter((id) => byId[id].effectsByCharacter[characterId] === "stay").length;
    return obstacles >= config.obstacleRange[0] && obstacles <= config.obstacleRange[1];
  })).length;
  return { examinedCount: examined.length, thematicCount: thematic.length, validForAllCharactersCount, countsByCharacter };
}

const DISCOVERY_LIMITED = {
  "visible-obstacles": [["V05", "V13", "V14", "V15"]],
  "ordinary-norms": [["N04", "N05", "N11"]],
};
const DISCOVERY_I_REQUIRED = [
  ["I01", "I02", "I03", "I04", "I05"],
  ["I06", "I07", "I08", "I09", "I10", "I11", "I16"],
];

function localDiscoverySelections(bank, characterId) {
  const config = MODES.discovery;
  const quota = config.quotas[bank.id];
  return combinations(bank.situations.map(({ id }) => id), quota).filter((candidate) => {
    const selected = new Set(candidate);
    const protections = candidate.filter((id) => bank.situations.find((item) => item.id === id).protective).length;
    if (protections > 1) return false;
    if (DISCOVERY_LIMITED[bank.id]?.some((group) => countIn(selected, group) > 1)) return false;
    if (bank.id === "invisible-effects" && DISCOVERY_I_REQUIRED.some((group) => countIn(selected, group) < 1)) return false;
    const requirement = config.characterRequirements[characterId];
    const requirementIds = [...(requirement?.all ?? []), ...(requirement?.any ?? []), ...(requirement?.atLeast?.ids ?? [])];
    if (requirementIds.some((id) => id.startsWith(MODES[bank.id].prefix)) && !characterRequirementValid(selected, requirement)) return false;
    return candidate.some((id) => bank.situations.find((item) => item.id === id).effectsByCharacter[characterId] === "stay");
  }).map((ids) => {
    const cards = ids.map((id) => bank.situations.find((item) => item.id === id));
    const signature = cards.reduce((counts, card) => {
      const key = `${card.protective ? "p" : "n"}${card.effectsByCharacter[characterId] === "stay" ? "s" : "a"}`;
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});
    return {
      ids,
      protectionCount: cards.filter(({ protective }) => protective).length,
      obstacleCount: cards.filter((card) => card.effectsByCharacter[characterId] === "stay").length,
      signature,
    };
  });
}

function canOrderDiscovery(signatureByMode) {
  const cards = Object.entries(signatureByMode).flatMap(([modeId, signature]) =>
    Object.entries(signature).flatMap(([kind, count]) =>
      Array.from({ length: count }, () => ({ modeId, protective: kind[0] === "p", decision: kind[1] }))));
  const visit = (remaining, previousMode, previousProtective, decisionRun, placed) => {
    if (remaining.length === 0) return true;
    for (let index = 0; index < remaining.length; index += 1) {
      const card = remaining[index];
      if (card.modeId === previousMode || (placed === 0 && card.protective) || (previousProtective && card.protective)) continue;
      const nextRun = decisionRun?.decision === card.decision ? decisionRun.count + 1 : 1;
      if (nextRun > 3) continue;
      const protectionsRemaining = remaining.filter((item, other) => other !== index && item.protective).length;
      if (placed >= 7 && !card.protective && protectionsRemaining === 0) continue;
      if (visit([...remaining.slice(0, index), ...remaining.slice(index + 1)], card.modeId, card.protective, { decision: card.decision, count: nextRun }, placed + 1)) return true;
    }
    return false;
  };
  return visit(cards, undefined, false, undefined, 0);
}

export function analyzeDiscoverySelections(data) {
  const sourceModes = MODES.discovery.sourceModes;
  const result = {};
  for (const characterId of GALLERIES.general.characterIds) {
    const local = Object.fromEntries(sourceModes.map((modeId) => [modeId, localDiscoverySelections(data.modes[modeId], characterId)]));
    const histograms = Object.fromEntries(sourceModes.map((modeId) => {
      const histogram = new Map();
      for (const item of local[modeId]) {
        const key = `${item.protectionCount}/${item.obstacleCount}/${JSON.stringify(item.signature)}`;
        const current = histogram.get(key);
        if (current) current.count += 1;
        else histogram.set(key, { ...item, count: 1 });
      }
      return [modeId, [...histogram.values()]];
    }));
    let validCount = 0;
    let allOrderable = true;
    const validSignatures = new Set();
    for (const visible of histograms["visible-obstacles"]) {
      for (const ordinary of histograms["ordinary-norms"]) {
        for (const invisible of histograms["invisible-effects"]) {
          if (visible.protectionCount + ordinary.protectionCount + invisible.protectionCount !== 2) continue;
          const obstacles = visible.obstacleCount + ordinary.obstacleCount + invisible.obstacleCount;
          if (obstacles < 3 || obstacles > 7) continue;
          validCount += visible.count * ordinary.count * invisible.count;
          validSignatures.add(JSON.stringify({
            "visible-obstacles": visible.signature,
            "ordinary-norms": ordinary.signature,
            "invisible-effects": invisible.signature,
          }));
        }
      }
    }
    for (const signature of validSignatures) {
      if (!canOrderDiscovery(JSON.parse(signature))) {
        allOrderable = false;
        break;
      }
    }
    result[characterId] = { validCount, allOrderable, localCounts: Object.fromEntries(sourceModes.map((id) => [id, local[id].length])) };
  }
  return result;
}

export function assertSelectionReferences(data) {
  const errors = [];
  const analyses = {};
  for (const modeId of ["visible-obstacles", "ordinary-norms", "invisible-effects", "intersectionalities"]) {
    const analysis = analyzeBankSelections(data.modes[modeId]);
    analyses[modeId] = analysis;
    const expected = EXPECTED_SELECTION_COUNTS[modeId];
    if (expected.thematic !== undefined && analysis.thematicCount !== expected.thematic) errors.push(`${modeId} : ${expected.thematic} lots thématiques attendus, ${analysis.thematicCount} obtenus`);
    if (expected.allCharacters !== undefined && analysis.validForAllCharactersCount !== expected.allCharacters) errors.push(`${modeId} : ${expected.allCharacters} lots valides pour toute la galerie attendus, ${analysis.validForAllCharactersCount} obtenus`);
    for (const [characterId, count] of Object.entries(analysis.countsByCharacter)) {
      const expectedCount = expected[characterId];
      if (expectedCount !== undefined && count !== expectedCount) errors.push(`${modeId}/${characterId} : ${expectedCount} lots valides attendus, ${count} obtenus`);
    }
  }
  const discovery = analyzeDiscoverySelections(data);
  analyses.discovery = discovery;
  for (const [characterId, result] of Object.entries(discovery)) {
    const expected = EXPECTED_SELECTION_COUNTS.discovery[characterId];
    if (result.validCount !== expected) errors.push(`discovery/${characterId} : ${expected} lots valides attendus, ${result.validCount} obtenus`);
    if (!result.allOrderable) errors.push(`discovery/${characterId} : au moins une signature valide n’est pas ordonnançable`);
  }
  return { errors, analyses };
}
