export interface CharacterEffect {
  characterId: string;
  displacement: number;
}

export type ContentByCharacter<T> = {
  common: T;
} & Partial<Record<string, T>>;

export interface SituationContent {
  title: string;
  description: string;
}

export interface ChoiceContent {
  text: string;
  feedback: string;
}

export interface Choice {
  id: string;
  content: ContentByCharacter<ChoiceContent>;
  effects: CharacterEffect[];
}

export interface Situation {
  id: string;
  availableFor?: string[];
  content: ContentByCharacter<SituationContent>;
  choices: Choice[];
}
