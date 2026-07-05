export interface CharacterEffect {
  characterId: string;
  displacement: number;
}

export interface Choice {
  text: string;
  feedback: string;
  effects: CharacterEffect[];
}

export interface Situation {
  id: number;
  title: string;
  description: string;
  choices: Choice[];
}
