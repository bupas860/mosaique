import type { Choice, Situation } from "./situation";

export interface ChoiceHistoryEntry {
  situation: Situation;
  choice: Choice;
  expectedAnswerId: "yes" | "no";
  isCorrect: boolean;
  displacement: number;
}
