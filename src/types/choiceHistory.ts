import type { EditorialSituationIdV2, MovementDecision } from "./editorialV2";
import type { ActivePlayableCharacterV2 } from "./runtimeV2";

export type GameCharacterV2 = ActivePlayableCharacterV2 & {
  readonly position: number;
};

export interface ChoiceHistoryEntryV2 {
  readonly situationId: EditorialSituationIdV2;
  readonly playerDecision: MovementDecision;
  readonly proposedDecision: MovementDecision;
  readonly matchesProposedInterpretation: boolean;
}
