import type { CharacterProfile } from "../../types/character";

export type CharacterRole =
  | "student"
  | "teacher"
  | "education-staff"
  | "parent"
  | "community-partner";

export interface CharacterEditorialProfile extends CharacterProfile {
  age?: number;
  pronouns?: string;
  role: CharacterRole;
  identityLabels?: string[];
  narrativeFocus?: string[];
}

export interface PlayableCharacter {
  id: string;
  kind: "playable";
  name: string;
  color: string;
  position: number;
  profile: CharacterEditorialProfile;
}

export interface NarrativeCharacter {
  id: string;
  kind: "narrative";
  name: string;
  profile: CharacterEditorialProfile;
  relationshipHints?: string[];
}
