export type CharacterId = `P${number}`;
export type SituationId = `S${number}`;
export type MechanismId = `M${number}`;

export interface CharacterData {
  id: CharacterId;
  name: string;
  age: number;
  schoolLevel: string;
  genderIdentity: string;
  affectiveAndSexualOrientation: string;
  pronouns: string[];
  characteristics: string[];
  accentColor: string;
  traits: string[];
  protectiveFactors: string[];
  mechanismIds: MechanismId[];
  pedagogicalRole: string;
  image?: string;
}

export type MechanismCategory =
  | "implicit_norms"
  | "invisibility"
  | "institutional_processes"
  | "social_relations"
  | "explicit_discrimination"
  | "protective_factor";

export type MechanismVisibility = "very_low" | "low" | "medium" | "high";

export interface MechanismData {
  id: MechanismId;
  name: string;
  category: MechanismCategory;
  definition: string;
  visibility: MechanismVisibility;
}

export interface SituationData {
  id: SituationId;
  title: string;
  context: string;
  text: string;
  question: string;
  pedagogicalIntent?: string;
  mechanismIds: MechanismId[];
  legacyMechanismLabel: string | null;
  sourceStatus: string;
  image?: string;
}

export interface PedagogicalFeedback {
  obstacle?: boolean;
  explanation?: string;
  schoolGoodPractice?: string;
  takeaway?: string;
}

export interface SituationCharacterFeedbackData {
  obstacle: boolean;
  explanation: string;
  schoolGoodPractice: string;
  takeaway: string;
}

export type MatrixResult = 0 | 1;
export type GameMatrix = Record<
  SituationId,
  Record<CharacterId, MatrixResult>
>;

export interface ResultSemantic {
  label: "advance" | "blocked";
  description: string;
}

export interface AnswerOption {
  id: "yes" | "no";
  label: string;
}

export interface GameConfigData {
  gameId: string;
  title: string;
  resultSemantics: Record<`${MatrixResult}`, ResultSemantic>;
  answerOptions: AnswerOption[];
  characterIds: CharacterId[];
  situationIds: SituationId[];
}
