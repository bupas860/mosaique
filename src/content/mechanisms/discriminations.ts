import type { SocialMechanism } from "./types";

export const discriminationMechanisms: SocialMechanism[] = [
  {
    id: "microaggression",
    label: "Micro-agression",
    description: "Remarque, geste ou présupposé qui contribue à banaliser une inégalité.",
    category: "discrimination",
  },
  {
    id: "misgendering",
    label: "Mégenrage",
    description: "Usage d’un genre ou de pronoms qui ne correspondent pas à la personne concernée.",
    category: "discrimination",
  },
  {
    id: "invisibilisation",
    label: "Invisibilisation",
    description: "Effacement d’une réalité, d’une identité ou d’une parole dans un cadre donné.",
    category: "discrimination",
  },
  {
    id: "validisme",
    label: "Validisme",
    description: "Normes et pratiques qui désavantagent les personnes handicapées ou perçues comme telles.",
    category: "discrimination",
  },
];
