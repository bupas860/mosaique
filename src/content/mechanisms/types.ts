export interface SocialMechanism {
  id: string;
  label: string;
  description: string;
  category: "discrimination" | "institution" | "relationship" | "resource";
}
