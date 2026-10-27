import { getActiveCharactersForMode } from "../../data/v2/activeModesRuntimeV2";
import type { EditorialCharacterIdV2, EditorialSituationIdV2 } from "../../types/editorialV2";
import type { ActiveGameModeIdV2 } from "../../data/v2/activeModesRuntimeV2";
import { PEDAGOGICAL_PRESETS } from "./pedagogicalPresets";

export type MixGallery = "general" | "intersectionalities";

export interface ThematicMixAllocation {
  readonly presetId: string;
  readonly title: string;
  readonly situationIds: readonly EditorialSituationIdV2[];
}

export interface ThematicMix {
  readonly mode: ActiveGameModeIdV2;
  readonly characterIds: readonly EditorialCharacterIdV2[];
  readonly situationIds: readonly EditorialSituationIdV2[];
  readonly allocations: readonly ThematicMixAllocation[];
}

/** Les propositions se croisent : une situation ne doit jamais compter deux fois. */
export function presetsForGallery(gallery: MixGallery) {
  return PEDAGOGICAL_PRESETS.filter((preset) =>
    gallery === "general" ? preset.session.mode !== "intersectionalities" : preset.session.mode === "intersectionalities",
  );
}

/**
 * Constitue un panier de 1 à 10 situations tirées de plusieurs propositions.
 * Chaque quota est satisfait exactement ; un identifiant présent dans deux
 * propositions est attribué à la première utilisée et exclu des suivantes.
 * La répartition intercale ensuite les familles pour éviter des blocs entiers.
 *
 * Les deux galeries ne peuvent être fusionnées sans changer le moteur du jeu.
 */
export function composeThematicMix(
  gallery: MixGallery,
  requested: Readonly<Record<string, number>>,
  random: () => number = Math.random,
): ThematicMix {
  const candidates = presetsForGallery(gallery);
  const selected = candidates.map((preset) => ({
    preset,
    quantity: requested[preset.id] ?? 0,
  })).filter(({ quantity }) => quantity > 0);

  const total = selected.reduce((sum, item) => sum + item.quantity, 0);
  if (Object.entries(requested).some(([id, quantity]) => !candidates.some((p) => p.id === id) && quantity !== 0)) {
    throw new Error("Une thématique sélectionnée n'appartient pas à ce groupe.");
  }
  if (Object.values(requested).some((quantity) => !Number.isInteger(quantity) || quantity < 0 || quantity > 10) ||
      total < 1 || total > 10) {
    throw new Error("Choisissez entre une et dix situations au total.");
  }

  const alreadyUsed = new Set<EditorialSituationIdV2>();
  const allocations: ThematicMixAllocation[] = selected.map(({ preset, quantity }) => {
    const choices = [...preset.session.situationIds].filter((id) => !alreadyUsed.has(id));
    // Fisher–Yates, pour ne pas privilégier toujours les mêmes lignes.
    for (let i = choices.length - 1; i > 0; i--) {
      const unit = random();
      if (!Number.isFinite(unit) || unit < 0 || unit >= 1) throw new Error("Tirage aléatoire invalide.");
      const j = Math.floor(unit * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    if (choices.length < quantity) {
      throw new Error(`Pas assez de situations distinctes disponibles dans « ${preset.title} ».`);
    }
    const situationIds = choices.slice(0, quantity);
    situationIds.forEach((id) => alreadyUsed.add(id));
    return { presetId: preset.id, title: preset.title, situationIds };
  });

  const situationIds: EditorialSituationIdV2[] = [];
  for (let index = 0; index < total; index++) {
    for (const { situationIds: ids } of allocations) {
      if (ids[index]) situationIds.push(ids[index]);
    }
  }

  const mode: ActiveGameModeIdV2 = gallery === "general" ? "discovery" : "intersectionalities";
  // Pour les X, garder initialement les personnages proposés par les thèmes retenus,
  // tous modifiables ensuite. Pour V/N/I, les neuf personnages restent disponibles.
  const characterIds = gallery === "general"
    ? getActiveCharactersForMode(mode).map(({ id }) => id)
    : [...new Set(selected.flatMap(({ preset }) => preset.session.characterIds))];

  return {
    mode, characterIds, situationIds, allocations,
  };
}
