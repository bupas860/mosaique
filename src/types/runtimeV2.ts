import type {
  CharacterIdV2,
  CharacterV2,
  EditorialCharacterIdV2,
  EditorialGalleryIdV2,
  EditorialModeIdV2,
  EditorialSituationIdV2,
  IntersectionalCharacterV2,
  MovementDecision,
  VisibleObstacleFeedback,
  VisibleObstacleSelectionRules,
  VisibleObstacleSituation,
  VisibleObstacleSituationId,
} from "./editorialV2";

export type RuntimeModeId = EditorialModeIdV2;
export type StandaloneRuntimeModeId = Exclude<RuntimeModeId, "discovery" | "intersectionalities">;
export type RuntimeRandom = () => number;

export interface RuntimeCharacterV2 {
  readonly id: EditorialCharacterIdV2;
  readonly name: string;
  readonly age: number;
  readonly schoolLevel: string;
  readonly pronouns: readonly string[];
  readonly profile?: string;
  readonly image: string | null;
}

export interface NormalizedRuntimeFeedbackV2 {
  readonly decision: MovementDecision;
  readonly explanation: string;
}

export interface NormalizedRuntimeSituationV2 {
  readonly id: EditorialSituationIdV2;
  readonly modeId: Exclude<RuntimeModeId, "discovery">;
  readonly title: string;
  readonly playerText: string;
  readonly question: string;
  readonly sceneType: string;
  readonly subfamily?: string;
  readonly mechanism: string;
  readonly interpretation?: string;
  readonly vigilance?: string;
  readonly intersectionalTest?: string;
  readonly mandatory: boolean;
  readonly protective: boolean;
  readonly effectsByCharacter: Readonly<Partial<Record<EditorialCharacterIdV2, MovementDecision>>>;
  readonly feedbacksByCharacter: Readonly<Partial<Record<EditorialCharacterIdV2, NormalizedRuntimeFeedbackV2>>>;
}

export interface RuntimeSelectionRequirementV2 {
  readonly all?: readonly EditorialSituationIdV2[];
  readonly any?: readonly EditorialSituationIdV2[];
  readonly atLeast?: Readonly<{ count: number; ids: readonly EditorialSituationIdV2[] }>;
}

export interface NormalizedRuntimeRulesV2 {
  readonly modeId: Exclude<RuntimeModeId, "discovery">;
  readonly galleryId: EditorialGalleryIdV2;
  readonly totalSituationCount: number;
  readonly variableSituationCount: number;
  readonly mandatorySituationIds: readonly EditorialSituationIdV2[];
  readonly variableSituationIds: readonly EditorialSituationIdV2[];
  readonly requiredGroups: readonly Readonly<{ id: string; minimum: number; situationIds: readonly EditorialSituationIdV2[] }>[];
  readonly limitedGroups: readonly Readonly<{ id: string; maximum: number; situationIds: readonly EditorialSituationIdV2[] }>[];
  readonly characterRequirements: Readonly<Record<string, RuntimeSelectionRequirementV2>>;
  readonly variableObstacleRangePerCharacter: Readonly<{ minimum: number; maximum: number }>;
}

export interface NormalizedRuntimeBankV2 {
  readonly modeId: Exclude<RuntimeModeId, "discovery">;
  readonly galleryId: EditorialGalleryIdV2;
  readonly idPrefix: "V" | "N" | "I" | "X";
  readonly situations: readonly NormalizedRuntimeSituationV2[];
  readonly rules: NormalizedRuntimeRulesV2;
}

export interface RuntimeSituationV2 {
  readonly id: EditorialSituationIdV2;
  readonly modeId: RuntimeModeId;
  readonly originMode: Exclude<RuntimeModeId, "discovery">;
  readonly title: string;
  readonly text: string;
  readonly playerText: string;
  readonly question: string;
  readonly sceneType: string;
  readonly subfamily?: string;
  readonly mechanism: string;
  readonly interpretation?: string;
  readonly vigilance?: string;
  readonly intersectionalTest?: string;
  readonly mandatory: boolean;
  readonly protective: boolean;
  readonly proposedDecision: MovementDecision;
  readonly feedback: NormalizedRuntimeFeedbackV2;
  readonly movements: Readonly<Partial<Record<EditorialCharacterIdV2, MovementDecision>>>;
  readonly image: null;
}

export interface PlayerSituationContentV2 {
  readonly title: string;
  readonly text: string;
  readonly question: string;
  readonly image: null;
}

export interface RuntimeGameSetV2 {
  readonly modeId: RuntimeModeId;
  readonly galleryId: EditorialGalleryIdV2;
  readonly characterId: EditorialCharacterIdV2;
  readonly situationIds: readonly EditorialSituationIdV2[];
  readonly situations: readonly RuntimeSituationV2[];
}

export interface CreateGameSetOptionsV2 {
  readonly modeId: RuntimeModeId;
  readonly characterId: EditorialCharacterIdV2 | string;
  readonly random?: RuntimeRandom;
}

export type IntersectionalRuntimeCharacterV2 = IntersectionalCharacterV2 & Readonly<{ image: string | null }>;

export interface CharacterPresentationConfigV2 {
  readonly accentColor: string;
  readonly image: string | null;
}

export interface PlayableCharacterV2 extends CharacterV2 {
  readonly accentColor: string;
  readonly image: string | null;
}

export interface PlayableIntersectionalCharacterV2 extends IntersectionalCharacterV2 {
  readonly accentColor: string;
  readonly image: string | null;
}

export type ActivePlayableCharacterV2 =
  | PlayableCharacterV2
  | PlayableIntersectionalCharacterV2;

export interface PlayableVisibleObstacleSituation extends VisibleObstacleSituation {
  readonly image: null;
  readonly movements: Readonly<Record<CharacterIdV2, MovementDecision>>;
}

export type PlayableVisibleObstacleFeedback = VisibleObstacleFeedback;

export interface VisibleObstaclesGameSet {
  readonly modeId: "visible-obstacles";
  readonly situationIds: readonly VisibleObstacleSituationId[];
  readonly situations: readonly PlayableVisibleObstacleSituation[];
}

export interface VisibleObstaclesRuntimeBank {
  readonly modeId: "visible-obstacles";
  readonly characters: readonly PlayableCharacterV2[];
  readonly charactersById: Readonly<Record<CharacterIdV2, PlayableCharacterV2>>;
  readonly situations: readonly PlayableVisibleObstacleSituation[];
  readonly situationsById: Readonly<Record<VisibleObstacleSituationId, PlayableVisibleObstacleSituation>>;
  readonly feedbacks: readonly PlayableVisibleObstacleFeedback[];
  readonly feedbacksByKey: Readonly<Record<`${VisibleObstacleSituationId}:${CharacterIdV2}`, PlayableVisibleObstacleFeedback>>;
  readonly rules: VisibleObstacleSelectionRules;
}
