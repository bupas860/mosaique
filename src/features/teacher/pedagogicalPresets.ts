import rawPresets from "./pedagogicalPresets.json";
import type { TeacherSessionV1 } from "./teacherConfig";
import { validateTeacherSession } from "./teacherConfig";

/**
 * Les propositions sont des entrées par intention pédagogique, jamais des
 * catégories d'âge ou des attestations d'adaptation à un niveau scolaire.
 * Chaque proposition est un point de départ intégralement modifiable.
 */
export interface PedagogicalPreset {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly session: TeacherSessionV1;
}

export const PEDAGOGICAL_PRESETS: readonly PedagogicalPreset[] = Object.freeze(
  rawPresets.map((preset) => Object.freeze({
    id: preset.id,
    title: preset.title,
    description: preset.description,
    session: validateTeacherSession({
      version: 1,
      mode: preset.mode,
      situationIds: preset.situationIds,
      characterIds: preset.characterIds,
    }),
  })),
);
