export type GameModeId = "discovery" | "visible-obstacles" | "ordinary-norms" | "invisible-effects" | "intersectionalities";

export interface GameMode {
  id: GameModeId;
  title: string;
  description: string;
  order: number;
  available: boolean;
  recommended?: boolean;
  recommendedLabel?: string;
  situationBankId?: string;
}
