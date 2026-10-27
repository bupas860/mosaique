import rawTaxonomy from "./situationMatrixTaxonomy.json";
import { teacherSituationsForMode } from "./teacherConfig";
import { PEDAGOGICAL_PRESETS } from "./pedagogicalPresets";
import type { NormalizedRuntimeSituationV2 } from "../../types/runtimeV2";
import type { EditorialSituationIdV2 } from "../../types/editorialV2";

/**
 * Deux dimensions de lecture indépendantes :
 * - famille de mécanismes (donnée canonique du moteur) ;
 * - angle pédagogique (repérage éditorial, non exclusif).
 *
 * Les quatre dimensions LGBTI+ sont un FILTRE, pas une autre famille de jeu.
 * Aucune de ces métadonnées ne change l'effet d'une carte sur un personnage.
 */
export const MATRIX_APPROACHES = [
  { id: "parole", label: "Paroles et interactions", short: "Paroles" },
  { id: "organisation", label: "Règles et organisation", short: "Organisation" },
  { id: "representation", label: "Représentations et modèles", short: "Représentations" },
  { id: "confidentialite", label: "Confidentialité et visibilité", short: "Confidentialité" },
  { id: "protection", label: "Protections et réactions", short: "Protections" },
] as const;

export const MATRIX_FAMILIES = [
  { id: "visible-obstacles", label: "Obstacles visibles", prefix: "V" },
  { id: "ordinary-norms", label: "Normes ordinaires", prefix: "N" },
  { id: "invisible-effects", label: "Effets invisibles", prefix: "I" },
] as const;

export const MATRIX_DIMENSIONS = [
  { id: "orientation", label: "Orientation sexuelle et affective", short: "Orientation sexuelle" },
  { id: "identite", label: "Identité de genre", short: "Identité de genre" },
  { id: "expression", label: "Expression de genre", short: "Expression de genre" },
  { id: "sexe", label: "Caractéristiques sexuées", short: "Caractéristiques sexuées" },
] as const;

export type MatrixApproachId = (typeof MATRIX_APPROACHES)[number]["id"];
export type MatrixDimensionId = (typeof MATRIX_DIMENSIONS)[number]["id"];
export type MatrixFilterId = MatrixDimensionId | "transversal";
export type GeneralMatrixFamilyId = (typeof MATRIX_FAMILIES)[number]["id"];

export type SituationMatrixTag = {
  readonly approaches: readonly MatrixApproachId[];
  readonly dimensions: readonly MatrixDimensionId[];
};

export interface MatrixEntry {
  readonly situation: NormalizedRuntimeSituationV2;
  readonly tags: SituationMatrixTag;
}

const taxonomy: Readonly<Record<string, SituationMatrixTag>> = rawTaxonomy as Record<string, SituationMatrixTag>;

export const MATRIX_GENERAL: readonly MatrixEntry[] = teacherSituationsForMode("discovery")
  .map((situation) => ({ situation, tags: taxonomy[situation.id] }));

export const MATRIX_INTERSECTION: readonly MatrixEntry[] = teacherSituationsForMode("intersectionalities")
  .map((situation) => ({ situation, tags: taxonomy[situation.id] }));

const xGroups = PEDAGOGICAL_PRESETS.filter((preset) => preset.session.mode === "intersectionalities");

export const MATRIX_INTERSECTION_GROUPS = [
  ...xGroups.map((preset) => ({
    id: preset.id,
    label: preset.title,
    situationIds: preset.session.situationIds,
  })),
  {
    id: "intersection-other",
    label: "Autres situations intersectionnelles",
    situationIds: MATRIX_INTERSECTION.filter((entry) =>
      !xGroups.some((preset) => preset.session.situationIds.includes(entry.situation.id)),
    ).map((entry) => entry.situation.id),
  },
] as const;

export function matchesMatrixFilters(tags: SituationMatrixTag, filters: readonly MatrixFilterId[]): boolean {
  if (filters.length === 0) return true;
  return (filters.includes("transversal") && tags.dimensions.length === 0) ||
    tags.dimensions.some((id) => filters.includes(id));
}

export function matrixGeneralCell(
  family: GeneralMatrixFamilyId,
  approach: MatrixApproachId,
  filters: readonly MatrixFilterId[] = [],
): readonly MatrixEntry[] {
  return MATRIX_GENERAL.filter((entry) =>
    entry.situation.modeId === family &&
    entry.tags.approaches.includes(approach) &&
    matchesMatrixFilters(entry.tags, filters),
  );
}

export function matrixIntersectionGroup(
  groupId: string,
  filters: readonly MatrixFilterId[] = [],
): readonly MatrixEntry[] {
  const group = MATRIX_INTERSECTION_GROUPS.find((item) => item.id === groupId);
  if (!group) return [];
  return MATRIX_INTERSECTION.filter((entry) =>
    group.situationIds.includes(entry.situation.id as EditorialSituationIdV2) &&
    matchesMatrixFilters(entry.tags, filters),
  );
}
