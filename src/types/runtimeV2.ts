import type {
  CharacterIdV2,
  CharacterV2,
  MovementDecision,
  VisibleObstacleFeedback,
  VisibleObstacleSelectionRules,
  VisibleObstacleSituation,
  VisibleObstacleSituationId,
} from "./editorialV2";

export interface CharacterPresentationConfigV2 {
  readonly accentColor: string;
  readonly image: null;
}

export interface PlayableCharacterV2 extends CharacterV2 {
  readonly accentColor: string;
  readonly image: null;
}

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
