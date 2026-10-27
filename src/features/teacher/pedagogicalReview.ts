import discoveryJson from "../../data/generated-v2/modes/discovery.json";
import { normalizedRuntimeBanksV2 } from "../../data/v2/allModesRuntimeV2";
import { getActiveCharactersForMode } from "../../data/v2/activeModesRuntimeV2";
import type { NormalizedRuntimeSituationV2, RuntimeSelectionRequirementV2 } from "../../types/runtimeV2";
import { teacherSituationsForMode, type TeacherSessionV1 } from "./teacherConfig";

export type FamilyId = "visible-obstacles" | "ordinary-norms" | "invisible-effects" | "intersectionalities";

export interface TeacherPedagogicalReview {
  readonly total: number;
  readonly protectedCount: number;
  readonly byFamily: Readonly<Record<FamilyId, number>>;
  readonly warnings: readonly string[];
}

/**
 * Aide à l'analyse, et non décision de conformité institutionnelle ou d'âge.
 * La liberté éditoriale du formateur reste entière : aucun avertissement ne
 * bloque le partage d'une séance techniquement valide.
 */
export function reviewTeacherSelection(config: TeacherSessionV1): TeacherPedagogicalReview {
  const byFamily: Record<FamilyId, number> = {
    "visible-obstacles": 0, "ordinary-norms": 0, "invisible-effects": 0, intersectionalities: 0,
  };
  const byId = new Map(teacherSituationsForMode(config.mode).map((situation) => [situation.id, situation]));
  const selected = config.situationIds.map((id) => byId.get(id)).filter((s): s is NormalizedRuntimeSituationV2 => !!s);
  const ids = new Set(selected.map((s) => s.id));
  for (const situation of selected) byFamily[situation.modeId]++;
  const protectedCount = selected.filter((s) => s.protective).length;
  const warnings: string[] = [];
  if (selected.length !== 10 || config.characterIds.length === 0) {
    return { total: selected.length, protectedCount, byFamily, warnings };
  }

  function checkRequirement(
    req: RuntimeSelectionRequirementV2 | undefined,
  ): boolean {
    if (!req) return true;
    if (req.all?.some((id) => !ids.has(id))) return false;
    if (req.any && !req.any.some((id) => ids.has(id))) return false;
    if (req.atLeast && req.atLeast.ids.filter((id) => ids.has(id)).length < req.atLeast.count) return false;
    return true;
  }

  if (config.mode === "discovery") {
    const rules = discoveryJson.rules;
    const familyNames: Readonly<Record<string, string>> = {
      "visible-obstacles": "obstacles visibles", "ordinary-norms": "normes ordinaires",
      "invisible-effects": "effets invisibles",
    };
    const expected = rules.quotas;
    const mismatches = (Object.keys(expected) as (keyof typeof expected)[])
      .filter((family) => byFamily[family] !== expected[family])
      .map((family) => `${familyNames[family]} : ${byFamily[family]} au lieu de ${expected[family]}`);
    if (mismatches.length) warnings.push("Répartition différente du mode Découverte habituel : " + mismatches.join(" ; ") + ".");
    if (protectedCount !== rules.protectiveCount) {
      warnings.push(`Le mode Découverte habituel comporte ${rules.protectiveCount} situations protectrices ; cette séance en comporte ${protectedCount}.`);
    }
    const requirements = rules.characterRequirements as Readonly<Record<string, RuntimeSelectionRequirementV2>>;
    const incomplete = config.characterIds.filter((id) => !checkRequirement(requirements[id]));
    if (incomplete.length) {
      const names = getActiveCharactersForMode(config.mode).filter(({ id }) => incomplete.includes(id)).map(({ name }) => name);
      warnings.push("Certaines situations liées au profil d'un personnage ne sont pas présentes : " + names.join(", ") + ".");
    }
  } else {
    const rules = normalizedRuntimeBanksV2[config.mode].rules;
    const missing = rules.mandatorySituationIds.filter((id) => !ids.has(id));
    if (missing.length) warnings.push("Situations normalement obligatoires dans le tirage libre absentes : " + missing.join(", ") + ".");
    for (const group of rules.requiredGroups) {
      const present = group.situationIds.filter((id) => ids.has(id)).length;
      if (present < group.minimum) warnings.push(`Un groupe de situations du tirage habituel est insuffisamment représenté : ${group.situationIds.join(", ")}.`);
    }
    for (const group of rules.limitedGroups) {
      const present = group.situationIds.filter((id) => ids.has(id)).length;
      if (present > group.maximum) warnings.push(`Le tirage habituel limite à ${group.maximum} le nombre de situations parmi : ${group.situationIds.join(", ")}.`);
    }
    const incomplete = config.characterIds.filter((id) => !checkRequirement(rules.characterRequirements[id]));
    if (incomplete.length) {
      const names = getActiveCharactersForMode(config.mode).filter(({ id }) => incomplete.includes(id)).map(({ name }) => name);
      warnings.push("Certaines situations liées au profil d'un personnage ne sont pas présentes : " + names.join(", ") + ".");
    }
  }

  const lowContrast = config.characterIds.filter((id) => {
    const stayed = selected.filter((s) => s.effectsByCharacter[id] === "stay").length;
    return stayed < 2 || stayed > 8;
  });
  if (lowContrast.length) {
    const names = getActiveCharactersForMode(config.mode).filter(({ id }) => lowContrast.includes(id)).map(({ name }) => name);
    warnings.push("Marche peu contrastée pour : " + names.join(", ") + " (presque toujours avancer ou rester sur place).");
  }
  return { total: selected.length, protectedCount, byFamily, warnings };
}
