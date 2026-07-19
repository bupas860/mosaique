import type { SocialMechanism } from "./types";

export const resourceMechanisms: SocialMechanism[] = [
  {
    id: "alliance",
    label: "Alliance",
    description: "Soutien concret qui respecte la parole et l’autonomie de la personne concernée.",
    category: "resource",
  },
  {
    id: "solidarite-entre-pairs",
    label: "Solidarité entre pairs",
    description: "Appui construit entre personnes partageant un espace, une expérience ou un enjeu commun.",
    category: "resource",
  },
  {
    id: "acces-aux-droits",
    label: "Accès aux droits",
    description: "Possibilité effective de faire reconnaître et appliquer ses droits.",
    category: "institution",
  },
  {
    id: "rapport-de-pouvoir-intracommunautaire",
    label: "Rapport de pouvoir intracommunautaire",
    description: "Inégalités de visibilité, de légitimité ou de prise de parole au sein d’un même groupe LGBTQIA+.",
    category: "relationship",
  },
];
