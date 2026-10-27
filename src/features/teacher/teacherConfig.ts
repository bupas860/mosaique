import { getActiveCharactersForMode, isActiveGameModeId, type ActiveGameModeIdV2 } from "../../data/v2/activeModesRuntimeV2";
import { normalizedRuntimeBanksV2 } from "../../data/v2/allModesRuntimeV2";
import type { EditorialCharacterIdV2, EditorialSituationIdV2 } from "../../types/editorialV2";
import type { NormalizedRuntimeSituationV2 } from "../../types/runtimeV2";

/** La configuration est publique, sans donnée personnelle ni serveur. */
export interface TeacherSessionV1 {
  readonly version: 1;
  readonly mode: ActiveGameModeIdV2;
  readonly situationIds: readonly EditorialSituationIdV2[];
  readonly characterIds: readonly EditorialCharacterIdV2[];
}

const MODE_BANKS: Readonly<Record<ActiveGameModeIdV2, readonly ("visible-obstacles" | "ordinary-norms" | "invisible-effects" | "intersectionalities")[]>> = {
  discovery: ["visible-obstacles", "ordinary-norms", "invisible-effects"],
  "visible-obstacles": ["visible-obstacles"],
  "ordinary-norms": ["ordinary-norms"],
  "invisible-effects": ["invisible-effects"],
  intersectionalities: ["intersectionalities"],
};

export function teacherSituationsForMode(mode: ActiveGameModeIdV2): readonly NormalizedRuntimeSituationV2[] {
  return MODE_BANKS[mode].flatMap((bank) => normalizedRuntimeBanksV2[bank].situations);
}

export function validateTeacherSession(value: unknown): TeacherSessionV1 {
  if (!value || typeof value !== "object") throw new Error("Cette séance n'est pas valide.");
  const config = value as Record<string, unknown>;
  if (config.version !== 1 || typeof config.mode !== "string" || !isActiveGameModeId(config.mode)) {
    throw new Error("Cette version de séance n'est pas reconnue.");
  }
  const mode = config.mode;
  const situationIds = config.situationIds;
  const characterIds = config.characterIds;
  const maxSituations = mode === "intersectionalities" ? 16 : mode === "discovery" ? 45 : teacherSituationsForMode(mode).length;
  if (!Array.isArray(situationIds) || situationIds.length < 1 || situationIds.length > maxSituations ||
      !situationIds.every((id) => typeof id === "string") ||
      new Set(situationIds).size !== situationIds.length) {
    throw new Error(`Choisissez entre 1 et ${maxSituations} situations distinctes.`);
  }
  if (!Array.isArray(characterIds) || characterIds.length < 1 ||
      !characterIds.every((id) => typeof id === "string") ||
      new Set(characterIds).size !== characterIds.length) {
    throw new Error("Sélectionnez au moins un personnage distinct.");
  }
  const bank = new Map(teacherSituationsForMode(mode).map((s) => [s.id, s]));
  const availableCharacters = new Set(getActiveCharactersForMode(mode).map((c) => c.id));
  if (!situationIds.every((id) => bank.has(id as EditorialSituationIdV2)) ||
      !characterIds.every((id) => availableCharacters.has(id as EditorialCharacterIdV2))) {
    throw new Error("Une situation ou un personnage n'appartient pas au mode de cette séance.");
  }
  for (const id of situationIds) {
    const situation = bank.get(id as EditorialSituationIdV2)!;
    for (const characterId of characterIds) {
      const effect = situation.effectsByCharacter[characterId as EditorialCharacterIdV2];
      const feedback = situation.feedbacksByCharacter[characterId as EditorialCharacterIdV2];
      if (!effect || !feedback || effect !== feedback.decision) {
        throw new Error("Une situation ne possède pas d'interprétation pour un personnage sélectionné.");
      }
    }
  }
  return {
    version: 1,
    mode,
    situationIds: situationIds as EditorialSituationIdV2[],
    characterIds: characterIds as EditorialCharacterIdV2[],
  };
}

/** Base64URL compact : uniquement des identifiants publics. */
export function encodeTeacherSession(value: TeacherSessionV1): string {
  const valid = validateTeacherSession(value);
  const serialized = JSON.stringify({ v: 1, m: valid.mode, s: valid.situationIds, c: valid.characterIds });
  return btoa(serialized).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeTeacherSession(code: string): TeacherSessionV1 {
  if (code.length < 8 || code.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(code)) {
    throw new Error("Le lien de séance est invalide ou incomplet.");
  }
  try {
    const raw = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    const payload: unknown = JSON.parse(raw);
    if (!payload || typeof payload !== "object") throw new Error("Format invalide");
    const data = payload as Record<string, unknown>;
    return validateTeacherSession({
      version: data.v,
      mode: data.m,
      situationIds: data.s,
      characterIds: data.c,
    });
  } catch {
    throw new Error("Impossible de lire cette séance. Demandez un nouveau lien à votre enseignant.");
  }
}

export function teacherSessionUrl(session: TeacherSessionV1): string {
  const url = new URL(window.location.href);
  url.hash = `#/jouer?seance=${encodeTeacherSession(session)}`;
  return url.toString();
}
