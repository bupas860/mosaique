export interface CharacterProfile {
  presentation: string;
  context: string;
  traits?: string[];
  protectiveFactors?: string[];
}

export interface Character {
  id: string;
  name: string;
  age: number;
  schoolLevel: string;
  genderIdentity: string;
  affectiveAndSexualOrientation: string;
  pronouns: string[];
  characteristics: string[];
  traits?: string[];
  protectiveFactors?: string[];
  color: string;
  position: number;
}
