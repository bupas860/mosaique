import type { MovementDecision, VisibleObstacleSituationId } from "./editorialV2";
import type { PlayableCharacterV2 } from "./runtimeV2";

export interface GameCharacterV2 extends PlayableCharacterV2 {
  readonly position: number;
}

export interface ChoiceHistoryEntryV2 {
  readonly situationId: VisibleObstacleSituationId;
  readonly playerDecision: MovementDecision;
  readonly proposedDecision: MovementDecision;
  readonly matchesProposedInterpretation: boolean;
}
