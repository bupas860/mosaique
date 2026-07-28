import type {
  EditorialCharacterIdV2,
  EditorialModeIdV2,
  EditorialSituationIdV2,
  MovementDecision,
} from "../types/editorialV2";
import type {
  NormalizedRuntimeBankV2,
  NormalizedRuntimeSituationV2,
  RuntimeRandom,
  StandaloneRuntimeModeId,
} from "../types/runtimeV2";

export function runtimeRandomValue(random: RuntimeRandom): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error(`Runtime V2 — la fonction aléatoire doit retourner une valeur comprise entre 0 inclus et 1 exclu ; valeur reçue : ${String(value)}`);
  }
  return value;
}

export function shuffledRuntimeValues<T>(values: readonly T[], random: RuntimeRandom): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(runtimeRandomValue(random) * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function combinations<T>(values: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  const visit = (start: number, current: T[]) => {
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

function requirementMatches(
  selected: ReadonlySet<string>,
  requirement: NormalizedRuntimeBankV2["rules"]["characterRequirements"][string] | undefined,
): boolean {
  if (requirement?.all?.some((id) => !selected.has(id))) return false;
  if (requirement?.any && !requirement.any.some((id) => selected.has(id))) return false;
  if (requirement?.atLeast) {
    const count = requirement.atLeast.ids.filter((id) => selected.has(id)).length;
    if (count < requirement.atLeast.count) return false;
  }
  return true;
}

export function getValidStandaloneVariableSelections(
  bank: NormalizedRuntimeBankV2,
  characterId: EditorialCharacterIdV2,
): readonly (readonly EditorialSituationIdV2[])[] {
  const { rules } = bank;
  const situationsById = new Map(bank.situations.map((situation) => [situation.id, situation]));
  return combinations(rules.variableSituationIds, rules.variableSituationCount).filter((candidate) => {
    const selected = new Set(candidate);
    if (rules.requiredGroups.some((group) => group.situationIds.filter((id) => selected.has(id)).length < group.minimum)) return false;
    if (rules.limitedGroups.some((group) => group.situationIds.filter((id) => selected.has(id)).length > group.maximum)) return false;
    if (!requirementMatches(selected, rules.characterRequirements[characterId])) return false;
    const obstacles = candidate.filter((id) => situationsById.get(id)?.effectsByCharacter[characterId] === "stay").length;
    return obstacles >= rules.variableObstacleRangePerCharacter.minimum
      && obstacles <= rules.variableObstacleRangePerCharacter.maximum;
  });
}

export function selectStandaloneSituationIds(
  bank: NormalizedRuntimeBankV2,
  characterId: EditorialCharacterIdV2,
  random: RuntimeRandom,
): readonly EditorialSituationIdV2[] {
  const selections = getValidStandaloneVariableSelections(bank, characterId);
  if (selections.length === 0) throw new Error(`Runtime V2 — mode ${bank.modeId}, personnage ${characterId} : aucun lot variable valide`);
  const selected = selections[Math.floor(runtimeRandomValue(random) * selections.length)];
  return shuffledRuntimeValues([...selected, ...bank.rules.mandatorySituationIds], random);
}

type DiscoveryLocalSelection = {
  readonly situations: readonly NormalizedRuntimeSituationV2[];
  readonly protectionCount: number;
  readonly obstacleCount: number;
};

const DISCOVERY_LIMITED_GROUPS: Partial<Record<StandaloneRuntimeModeId, readonly (readonly EditorialSituationIdV2[])[]>> = {
  "visible-obstacles": [["V05", "V13", "V14", "V15"]],
  "ordinary-norms": [["N04", "N05", "N11"]],
};
const DISCOVERY_INVISIBLE_REQUIRED = [
  ["I01", "I02", "I03", "I04", "I05"],
  ["I06", "I07", "I08", "I09", "I10", "I11", "I16"],
] as const;

function getDiscoveryLocalSelections(
  bank: NormalizedRuntimeBankV2,
  quota: number,
  characterId: EditorialCharacterIdV2,
  characterRequirement: NormalizedRuntimeBankV2["rules"]["characterRequirements"][string] | undefined,
): DiscoveryLocalSelection[] {
  return combinations(bank.situations, quota).filter((situations) => {
    const selected = new Set(situations.map(({ id }) => id));
    const protectionCount = situations.filter(({ protective }) => protective).length;
    if (protectionCount > 1) return false;
    const limitedGroups = bank.modeId === "visible-obstacles" || bank.modeId === "ordinary-norms"
      ? DISCOVERY_LIMITED_GROUPS[bank.modeId]
      : undefined;
    if (limitedGroups?.some((group) => group.filter((id) => selected.has(id)).length > 1)) return false;
    if (bank.modeId === "invisible-effects" && DISCOVERY_INVISIBLE_REQUIRED.some((group) => group.every((id) => !selected.has(id)))) return false;
    const requirementIds = [
      ...(characterRequirement?.all ?? []),
      ...(characterRequirement?.any ?? []),
      ...(characterRequirement?.atLeast?.ids ?? []),
    ];
    const relevantRequirement = requirementIds.some((id) => id.startsWith(bank.idPrefix));
    if (relevantRequirement && !requirementMatches(selected, characterRequirement)) return false;
    return situations.some((situation) => situation.effectsByCharacter[characterId] === "stay");
  }).map((situations) => ({
    situations,
    protectionCount: situations.filter(({ protective }) => protective).length,
    obstacleCount: situations.filter((situation) => situation.effectsByCharacter[characterId] === "stay").length,
  }));
}

function discoveryOrderValid(
  situations: readonly NormalizedRuntimeSituationV2[],
  characterId: EditorialCharacterIdV2,
): boolean {
  if (situations[0]?.protective) return false;
  if (!situations.slice(-3).some(({ protective }) => protective)) return false;
  let decisionRun = 0;
  let previousDecision: MovementDecision | undefined;
  for (let index = 0; index < situations.length; index += 1) {
    const current = situations[index];
    const previous = situations[index - 1];
    if (previous?.modeId === current.modeId) return false;
    if (previous?.protective && current.protective) return false;
    const decision = current.effectsByCharacter[characterId];
    decisionRun = decision === previousDecision ? decisionRun + 1 : 1;
    if (decisionRun > 3) return false;
    previousDecision = decision;
  }
  return true;
}

export function orderDiscoverySituations(
  situations: readonly NormalizedRuntimeSituationV2[],
  characterId: EditorialCharacterIdV2,
  random: RuntimeRandom,
): readonly NormalizedRuntimeSituationV2[] {
  const visit = (ordered: NormalizedRuntimeSituationV2[], remaining: NormalizedRuntimeSituationV2[]): NormalizedRuntimeSituationV2[] | undefined => {
    if (remaining.length === 0) return discoveryOrderValid(ordered, characterId) ? ordered : undefined;
    for (const candidate of shuffledRuntimeValues(remaining, random)) {
      const previous = ordered.at(-1);
      if (ordered.length === 0 && candidate.protective) continue;
      if (previous?.modeId === candidate.modeId || (previous?.protective && candidate.protective)) continue;
      const recentDecisions = [...ordered.slice(-3), candidate].map((item) => item.effectsByCharacter[characterId]);
      if (recentDecisions.length === 4 && new Set(recentDecisions).size === 1) continue;
      const result = visit([...ordered, candidate], remaining.filter(({ id }) => id !== candidate.id));
      if (result) return result;
    }
    return undefined;
  };
  const ordered = visit([], [...situations]);
  if (!ordered) throw new Error(`Runtime V2 — mode discovery, personnage ${characterId} : lot valide impossible à ordonner`);
  return ordered;
}

export function selectDiscoverySituations(
  banks: Readonly<Record<StandaloneRuntimeModeId, NormalizedRuntimeBankV2>>,
  characterId: EditorialCharacterIdV2,
  random: RuntimeRandom,
  quotas: Readonly<Record<StandaloneRuntimeModeId, number>>,
  requirement: NormalizedRuntimeBankV2["rules"]["characterRequirements"][string] | undefined,
  obstacleRange: Readonly<{ minimum: number; maximum: number }>,
): readonly NormalizedRuntimeSituationV2[] {
  const modeIds = Object.keys(quotas) as StandaloneRuntimeModeId[];
  const local = Object.fromEntries(modeIds.map((modeId) => [
    modeId,
    getDiscoveryLocalSelections(banks[modeId], quotas[modeId], characterId, requirement),
  ])) as Record<StandaloneRuntimeModeId, DiscoveryLocalSelection[]>;
  const protectionPatterns = shuffledRuntimeValues([
    new Set<EditorialModeIdV2>(["visible-obstacles", "ordinary-norms"]),
    new Set<EditorialModeIdV2>(["visible-obstacles", "invisible-effects"]),
    new Set<EditorialModeIdV2>(["ordinary-norms", "invisible-effects"]),
  ], random);
  for (const protectedModes of protectionPatterns) {
    const candidates = Object.fromEntries(modeIds.map((modeId) => [
      modeId,
      shuffledRuntimeValues(local[modeId].filter(({ protectionCount }) => protectionCount === (protectedModes.has(modeId) ? 1 : 0)), random),
    ])) as Record<StandaloneRuntimeModeId, DiscoveryLocalSelection[]>;
    for (const visible of candidates["visible-obstacles"]) {
      for (const ordinary of candidates["ordinary-norms"]) {
        for (const invisible of candidates["invisible-effects"]) {
          const obstacleCount = visible.obstacleCount + ordinary.obstacleCount + invisible.obstacleCount;
          if (obstacleCount < obstacleRange.minimum || obstacleCount > obstacleRange.maximum) continue;
          return orderDiscoverySituations(
            [...visible.situations, ...ordinary.situations, ...invisible.situations],
            characterId,
            random,
          );
        }
      }
    }
  }
  throw new Error(`Runtime V2 — mode discovery, personnage ${characterId} : aucun lot valide`);
}
