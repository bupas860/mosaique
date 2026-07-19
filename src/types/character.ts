export interface CharacterAvatar {
  src: string;
  alt: string;
}

export interface CharacterProfile {
  presentation: string;
  context: string;
  age?: number;
  schoolLevel?: string;
  identity?: string;
  traits?: string[];
  protectiveFactors?: string[];
  avatar?: CharacterAvatar;
  additionalInformation?: Array<{
    label: string;
    value: string;
  }>;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  position: number;
  profile: CharacterProfile;
}
