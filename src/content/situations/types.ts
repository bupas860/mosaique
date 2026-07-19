import type { Situation } from "../../types/situation";

export interface SituationEditorialMetadata {
  characterIds: string[];
  narrativeCharacterIds?: string[];
  contextId: string;
  mechanismIds: string[];
  emotionIds: string[];
}

export type ContentSituation = Situation & SituationEditorialMetadata;
