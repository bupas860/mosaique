export type Choice = {
  id: string;
  label: string;
  feedback: string;
};

export type Situation = {
  id: string;
  title: string;
  text: string;
  choices: Choice[];
};
