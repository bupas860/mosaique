import { difficultEmotions } from "./difficult";
import { resourceEmotions } from "./resources";

export const emotions = [...difficultEmotions, ...resourceEmotions];

export type { EmotionReference } from "./types";
