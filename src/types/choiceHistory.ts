import type {
  EditorialModeIdV2,
  EditorialSituationIdV2,
  MovementDecision,
} from "./editorialV2";
import type { ActivePlayableCharacterV2 } from "./runtimeV2";

export type GameCharacterV2 = ActivePlayableCharacterV2 & {
  readonly position: number;
};

export interface ChoiceHistoryEntryV2 {
  readonly situationId: EditorialSituationIdV2;
  readonly originMode?: Exclude<EditorialModeIdV2, "discovery">;
  readonly playerDecision: MovementDecision;
  readonly proposedDecision: MovementDecision;
  readonly matchesProposedInterpretation: boolean;
}
