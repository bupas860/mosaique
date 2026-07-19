import { discriminationMechanisms } from "./discriminations";
import { resourceMechanisms } from "./resources";

export const socialMechanisms = [
  ...discriminationMechanisms,
  ...resourceMechanisms,
];

export type { SocialMechanism } from "./types";
