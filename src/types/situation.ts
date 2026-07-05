export interface Choice {
  text: string;
  feedback: string;
}

export interface Situation {
  id: number;
  title: string;
  description: string;
  choices: Choice[];
}
