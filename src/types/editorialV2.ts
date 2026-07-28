export type CharacterIdV2 = "P01" | "P02" | "P03" | "P04" | "P05" | "P06" | "P07" | "P08" | "P09";
export type IntersectionalCharacterIdV2 = "XP01" | "XP02" | "XP03" | "XP04" | "XP05" | "XP06" | "XP07" | "XP08";
export type EditorialCharacterIdV2 = CharacterIdV2 | IntersectionalCharacterIdV2;
export type EditorialGalleryIdV2 = "general" | "intersectional";
export type EditorialModeIdV2 = "visible-obstacles" | "ordinary-norms" | "invisible-effects" | "intersectionalities" | "discovery";
export type VisibleObstacleSituationId = "V01" | "V02" | "V03" | "V04" | "V05" | "V06" | "V07" | "V08" | "V09" | "V10" | "V11" | "V12" | "V13" | "V14" | "V15" | "V16";
export type OrdinaryNormSituationId = `N${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13"}`;
export type InvisibleEffectSituationId = `I${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16"}`;
export type IntersectionalitySituationId = `X${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16"}`;
export type EditorialSituationIdV2 = VisibleObstacleSituationId | OrdinaryNormSituationId | InvisibleEffectSituationId | IntersectionalitySituationId;
export type MovementDecision = "advance" | "stay";
export type SceneType = "direct" | "climate" | "protective";
export type VisibleObstacleGroupId = "collective-trivialization" | "gender-expression-recognition" | "outing-surveillance-rumor-digital" | "aromantic-asexual-bisexual-pansexual";

export interface CharacterV2 {
  readonly id: CharacterIdV2;
  readonly name: string;
  readonly age: number;
  readonly schoolLevel: string;
  readonly genderIdentity: string;
  readonly orientation?: string;
  readonly pronouns: readonly string[];
  readonly presentation: string;
  readonly gamePoints: readonly string[];
}

export interface IntersectionalCharacterV2 {
  readonly id: IntersectionalCharacterIdV2;
  readonly name: string;
  readonly age: number;
  readonly schoolLevel: string;
  readonly profile: string;
  readonly pronouns: readonly string[];
}

export interface EditorialSituationV2 {
  readonly id: EditorialSituationIdV2;
  readonly modeId: Exclude<EditorialModeIdV2, "discovery">;
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
  readonly feedbacksByCharacter: Readonly<Partial<Record<EditorialCharacterIdV2, {
    readonly decision: MovementDecision;
    readonly explanation: string;
  }>>>;
}

export interface DiscoverySituationReferenceV2 {
  readonly id: Exclude<EditorialSituationIdV2, IntersectionalitySituationId>;
  readonly originMode: "visible-obstacles" | "ordinary-norms" | "invisible-effects";
}

export interface VisibleObstacleSituation {
  readonly id: VisibleObstacleSituationId;
  readonly modeId: "visible-obstacles";
  readonly title: string;
  readonly sceneType: SceneType;
  readonly subfamily: string;
  readonly text: string;
  readonly question: string;
  readonly mechanism: string;
  readonly caution: string;
  readonly mandatory: boolean;
}

export interface VisibleObstacleFeedback {
  readonly situationId: VisibleObstacleSituationId;
  readonly characterId: CharacterIdV2;
  readonly decision: MovementDecision;
  readonly explanation: string;
}

export type VisibleObstacleMatrix = Readonly<Record<VisibleObstacleSituationId, Readonly<Record<CharacterIdV2, MovementDecision>>>>;

export interface VisibleObstacleRequiredGroup {
  readonly id: VisibleObstacleGroupId;
  readonly minimum: number;
  readonly situationIds: readonly VisibleObstacleSituationId[];
}

export interface VisibleObstacleLimitedGroup {
  readonly id: VisibleObstacleGroupId;
  readonly maximum: number;
  readonly situationIds: readonly VisibleObstacleSituationId[];
}

export interface VisibleObstacleSelectionRules {
  readonly modeId: "visible-obstacles";
  readonly totalSituationCount: number;
  readonly variableSituationCount: number;
  readonly mandatorySituationIds: readonly VisibleObstacleSituationId[];
  readonly variableSituationIds: readonly VisibleObstacleSituationId[];
  readonly requiredGroups: readonly VisibleObstacleRequiredGroup[];
  readonly limitedGroups: readonly VisibleObstacleLimitedGroup[];
  readonly variableObstacleRangePerCharacter: Readonly<{ minimum: number; maximum: number }>;
}

export interface VisibleObstacleManifest {
  readonly schemaVersion: 1;
  readonly modeId: "visible-obstacles";
  readonly sourceFiles: readonly string[];
  readonly characterCount: number;
  readonly situationCount: number;
  readonly decisionCount: number;
  readonly feedbackCount: number;
  readonly validCombinationCount: number;
  readonly files: Readonly<{ characters: string; situations: string; matrix: string; feedbacks: string; rules: string }>;
}

export interface VisibleObstaclesBank {
  readonly modeId: "visible-obstacles";
  readonly characters: readonly CharacterV2[];
  readonly situations: readonly VisibleObstacleSituation[];
  readonly matrix: VisibleObstacleMatrix;
  readonly feedbacks: readonly VisibleObstacleFeedback[];
  readonly rules: VisibleObstacleSelectionRules;
  readonly manifest: VisibleObstacleManifest;
}
